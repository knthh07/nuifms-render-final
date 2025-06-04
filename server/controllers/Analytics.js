const JobOrder = require("../models/jobOrder");
const Campus = require("../models/Entity");

const analytics = async (req, res) => {
  try {
    const analytics = {};

    const jobOrders = await JobOrder.find();
    const campuses = await Campus.find();

    const officeDetailsMap = new Map();

    campuses.forEach((campus) => {
      campus.buildings.forEach((building) => {
        building.floors.forEach((floor) => {
          floor.offices.forEach((office) => {
            officeDetailsMap.set(office.name.toLowerCase().trim(), {
              campus: campus.name,
              building: building.name,
              floor: floor.number,
            });
          });
        });
      });
    });

    const getOfficeDetails = (reqOffice) => {
      const normalizedOffice = reqOffice?.toLowerCase().trim();
      if (officeDetailsMap.has(normalizedOffice)) {
        return officeDetailsMap.get(normalizedOffice);
      }
      for (let [key, value] of officeDetailsMap) {
        if (key.includes(normalizedOffice)) {
          return value;
        }
      }
      return { campus: "Unknown", building: "Unknown", floor: "Unknown" };
    };

    const objectAnalysis = jobOrders.map((order) => {
      const officeDetails = getOfficeDetails(order.reqOffice || "");
      return {
        ...order.toObject(),
        campus: officeDetails.campus,
        building: officeDetails.building,
        floor: officeDetails.floor,
      };
    });

    // --- Compute frequency and days between for each (object + scenario + office)
    const groupedMap = {};

    objectAnalysis.forEach((item) => {
      const key = `${item.object}|${item.scenario}|${item.reqOffice}`;
      if (!groupedMap[key]) {
        groupedMap[key] = [];
      }
      groupedMap[key].push(item);
    });

    analytics.recommendations = [];

    const getPrescription = (object, scenario, count, daysBetween) => {
      if (count >= 5 && daysBetween <= 14) {
        return `This issue is recurring rapidly. Recommend immediate replacement or major overhaul of the ${object}.`;
      } else if (count >= 3 && daysBetween <= 30) {
        return `Recommend scheduling regular maintenance checks for the ${object} and monitoring for escalation.`;
      } else if (count >= 2 && daysBetween > 30) {
        return `Suggest light maintenance or a routine inspection of the ${object}.`;
      }
      return `Recommend frequent maintenance or replacement.`; // fallback
    };


    for (const groupKey in groupedMap) {
      const items = groupedMap[groupKey];
      const sorted = items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const count = items.length;
      const firstDate = new Date(sorted[0].createdAt);
      const lastDate = new Date(sorted[sorted.length - 1].createdAt);
      const daysBetween = Math.max(1, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)));

      const isRelevant =
        (count >= 5 && daysBetween <= 14) ||
        (count >= 3 && daysBetween <= 30) ||
        (count >= 2 && daysBetween > 30);

      items.forEach((item) => {
        item.count = count;
        item.daysBetween = daysBetween;
      });

      if (isRelevant) {
        const { object, scenario, reqOffice, building, campus } = items[0];
        const prescription = getPrescription(object, scenario, count, daysBetween);

        analytics.recommendations.push({
          message: `The ${object} at ${reqOffice} (${building}, ${campus}) has been reported as "${scenario}" ${count} times in the last ${daysBetween} days. ${prescription}`,
        });
      }
    }

    // Group objectAnalysis for frontend (by scenario)
    const groupedData = objectAnalysis.reduce((acc, item) => {
      const key = item.scenario;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    analytics.objectAnalysis = Object.entries(groupedData).map(([scenario, items]) => ({
      scenario,
      items,
    }));

    res.json(analytics);
  } catch (error) {
    console.error("Error during analytics:", error);
    res.status(500).send("An error occurred while fetching analytics data.");
  }
};

module.exports = { analytics };
