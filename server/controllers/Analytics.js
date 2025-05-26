const JobOrder = require("../models/jobOrder");
const Campus = require("../models/Entity");
const Recommendation = require("../models/recommendation");
const mongoose = require('mongoose');

// In-memory cache with TTL (replaces Redis)
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes in milliseconds

// Levenshtein distance implementation
const levenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
};

const getOfficeDetails = (reqOffice, officeDetailsMap) => {
  const normalizedOffice = reqOffice?.toLowerCase().trim();
  if (!normalizedOffice) return { campus: "Unknown", building: "Unknown" };

  // Exact match check
  if (officeDetailsMap.has(normalizedOffice)) {
    return officeDetailsMap.get(normalizedOffice);
  }

  // Fuzzy match using Levenshtein distance
  let closestMatch = { distance: Infinity, value: null };
  for (const [key, value] of officeDetailsMap) {
    const distance = levenshteinDistance(normalizedOffice, key);
    if (distance < closestMatch.distance) {
      closestMatch = { distance, value };
    }
    if (distance === 0) break;
  }

  return closestMatch.distance <= 2 ? closestMatch.value : { campus: "Unknown", building: "Unknown" };
};

const processJobOrders = async (page = 1) => {
  const PAGE_SIZE = 50;
  const skip = (page - 1) * PAGE_SIZE;

  const [jobOrders, campuses] = await Promise.all([
    JobOrder.find().skip(skip).limit(PAGE_SIZE).lean(),
    Campus.find().lean(),
  ]);

  const officeDetailsMap = new Map();
  campuses.forEach(campus => {
    campus.buildings.forEach(building => {
      building.floors.forEach(floor => {
        floor.offices.forEach(office => {
          const key = office.name.toLowerCase().trim();
          officeDetailsMap.set(key, {
            campus: campus.name,
            building: building.name,
          });
        });
      });
    });
  });

  return jobOrders.map(order => ({
    ...order,
    ...getOfficeDetails(order.reqOffice, officeDetailsMap),
  }));
};

const analytics = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const cacheKey = `analytics:${page}`;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    // Process data
    const [objectAnalysis, totalDocuments, existingRecs] = await Promise.all([
      processJobOrders(page),
      JobOrder.countDocuments(),
      Recommendation.find({ resolved: false }).lean()
    ]);

    const groupedMap = objectAnalysis.reduce((acc, item) => {
      const key = `${item.object}|${item.scenario}|${item.reqOffice}`.toLowerCase();
      acc[key] = acc[key] || [];
      acc[key].push({ ...item, count: acc[key].length + 1 });
      return acc;
    }, {});

    const thresholds = {
      high: [5, 14],
      medium: [3, 30],
      low: [2, 365]
    };

    const recommendations = [];
    const now = new Date();

    for (const [key, items] of Object.entries(groupedMap)) {
      const sorted = items.sort((a, b) => a.createdAt - b.createdAt);
      const count = items.length;
      const daysBetween = Math.ceil((sorted[sorted.length - 1].createdAt - sorted[0].createdAt) / 86400000) || 1;

      const meetsThreshold =
        (count >= thresholds.high[0] && daysBetween <= thresholds.high[1]) ||
        (count >= thresholds.medium[0] && daysBetween <= thresholds.medium[1]) ||
        (count >= thresholds.low[0] && daysBetween <= thresholds.low[1]);

      if (meetsThreshold) {
        const { object, scenario, reqOffice, building, campus } = items[0];
        const exists = existingRecs.some(rec =>
          rec.object === object &&
          rec.scenario === scenario &&
          rec.reqOffice === reqOffice
        );

        if (!exists) {
          const newRec = await Recommendation.create({
            message: `The ${object} at ${reqOffice} (${building}, ${campus}) has been reported ${count} times in ${daysBetween} days. Consider maintenance.`,
            object,
            scenario,
            reqOffice,
            count,
            daysBetween,
            history: [{
              timestamp: now,
              action: 'system-generated',
              details: 'Initial detection'
            }]
          });
          recommendations.push(newRec);
        }
      }
    }

    // Get active recommendations
    const activeRecommendations = await Recommendation.find({ resolved: false })
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const scenarioGroups = objectAnalysis.reduce((acc, item) => {
      const key = item.scenario.toLowerCase();
      acc[key] = acc[key] || { scenario: item.scenario, items: [] };
      acc[key].items.push(item);
      return acc;
    }, {});

    const response = {
      chartData: Object.values(scenarioGroups).map(g => ({
        scenario: g.scenario,
        count: g.items.length,
      })),
      recommendations: activeRecommendations,
      groupedData: Object.values(scenarioGroups),
      totalPages: Math.ceil(totalDocuments / 50),
      page,
      thresholds
    };

    cache.set(cacheKey, { timestamp: Date.now(), data: response });
    res.json(response);
  } catch (error) {
    console.error(`Analytics Error:`, error);
    res.status(500).json({
      message: "Error processing analytics",
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

const resolveRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user?.id; // 👈 Use authenticated user's ID

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid recommendation ID" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const recommendation = await Recommendation.findByIdAndUpdate(
      id,
      {
        resolved: true,
        resolvedBy: userId,
        resolvedAt: new Date(),
        notes,
        $push: {
          history: {
            timestamp: new Date(),
            action: 'resolved',
            user: userId,
            details: notes || 'Resolution approved'
          }
        }
      },
      { new: true, runValidators: true }
    ).populate('resolvedBy', 'name email');

    if (!recommendation) {
      return res.status(404).json({ message: "Recommendation not found" });
    }

    res.json({
      success: true,
      message: "Recommendation resolved successfully",
      recommendation
    });
  } catch (error) {
    console.error('Resolution Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.stack
    });
  }
};

module.exports = { analytics, resolveRecommendation };