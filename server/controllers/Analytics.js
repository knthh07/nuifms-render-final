const JobOrder = require("../models/jobOrder");

const analytics = async (req, res) => {
  try {
    const analytics = {};

    // Job Type Analysis
    analytics.jobTypes = await JobOrder.aggregate([
      { $group: { _id: "$jobType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Urgency Recommendations
    analytics.urgentJobs = await JobOrder.find({
      urgency: "High",
      status: "ongoing",
    });

    // Status Tracking
    analytics.statusCounts = await JobOrder.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Campus Analysis
    analytics.campusAnalysis = await JobOrder.aggregate([
      { $group: { _id: "$campus", count: { $sum: 1 } } },
    ]);

    // Date of Request Trends
    analytics.requestTrends = await JobOrder.aggregate([
      {
        $match: {
          createdAt: { $exists: true, $type: "date" },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Prescriptive Recommendations
    analytics.recommendations = [];

    // Example recommendation based on urgent jobs
    if (analytics.urgentJobs.length > 0) {
      analytics.recommendations.push(
        "Prioritize urgent jobs. Consider reallocating resources to handle high-demand tasks."
      );
    }

    // Add more recommendations based on other insights
    if (
      analytics.statusCounts.find((s) => s._id === "pending" && s.count > 10)
    ) {
      analytics.recommendations.push(
        "Review the process for pending jobs. Consider assigning additional personnel to reduce backlog."
      );
    }

    // Analyze object and scenario for prescriptive recommendations
    const objectScenarioAnalysis = await JobOrder.aggregate([
      {
        $group: {
          _id: {
            object: "$object",
            scenario: "$scenario",
            campus: "$campus",
            building: "$building",
            floor: "$floor",
            reqOffice: "$reqOffice",
          },
          count: { $sum: 1 },
          lastRequestDate: { $max: "$createdAt" }, // Use createdAt to find the latest date
        },
      },
      {
        $match: {
          lastRequestDate: { $type: "date" }, // Ensure that lastRequestDate is a valid Date
        },
      },
      {
        $addFields: {
          daysSinceLastRequest: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), "$lastRequestDate"] },
                1000 * 60 * 60 * 24, // Convert milliseconds to days
              ],
            },
          },
        },
      },
      {
        $project: {
          object: "$_id.object",
          scenario: "$_id.scenario",
          campus: "$_id.campus",
          building: "$_id.building",
          floor: "$_id.floor",
          reqOffice: "$_id.reqOffice",
          count: 1,
          daysSinceLastRequest: 1,
        },
      },
    ]);

    // After your analysis logic...
    analytics.objectAnalysis = objectScenarioAnalysis; // Make sure to assign the object analysis here

    if (Array.isArray(objectScenarioAnalysis)) {
      objectScenarioAnalysis.forEach((item) => {
        if (item.count >= 3 && item.daysSinceLastRequest <= 7) {
          analytics.recommendations.push(
            `Consider replacing the ${item.object} at ${item.reqOffice} in ${item.building}, ${item.campus} due to frequent ${item.scenario} reports.`
          );
        } else if (item.count > 1 && item.daysSinceLastRequest > 120) {
          analytics.recommendations.push(
            `Schedule maintenance for the ${item.object} at ${item.reqOffice} in ${item.building}, ${item.campus} due to infrequent requests.`
          );
        }
      });
    }

    // Respond with the complete analytics object
    res.json(analytics);
  } catch (error) {
    console.error("Error during analytics:", error);
    res.status(500).send("An error occurred while fetching analytics data.");
  }
};

module.exports = {
  analytics,
};
