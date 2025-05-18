const JobOrder = require("../models/jobOrder");
const Campus = require("../models/Entity"); // Import the Campus model

const analytics = async (req, res) => {
  try {
    const analytics = {};

    // Fetch all job orders
    const jobOrders = await JobOrder.find();

    // Fetch all campuses with their buildings and offices
    const campuses = await Campus.find();

    // Map to store office details (campus, building, floor)
    const officeDetailsMap = new Map();

    // Populate the officeDetailsMap
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

    // Helper function to find office details (with partial matching)
    const getOfficeDetails = (reqOffice) => {
      const normalizedOffice = reqOffice.toLowerCase().trim();
      if (officeDetailsMap.has(normalizedOffice)) {
        return officeDetailsMap.get(normalizedOffice);
      }

      // Attempt a partial match
      for (let [key, value] of officeDetailsMap) {
        if (key.includes(normalizedOffice)) {
          return value;
        }
      }

      console.warn(`Warning: Office '${reqOffice}' not found in officeDetailsMap.`);
      return { campus: "Unknown", building: "Unknown", floor: "Unknown" };
    };

    // --- Object-Specific Analysis ---
    const objectAnalysis = jobOrders.map((order) => {
      const officeDetails = getOfficeDetails(order.reqOffice);

      return {
        ...order.toObject(),
        campus: officeDetails.campus,
        building: officeDetails.building,
        floor: officeDetails.floor,
      };
    });

    // Group data by scenario
    const groupedData = objectAnalysis.reduce((acc, item) => {
      const key = item.scenario;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item); // Push the item directly (no nesting)
      return acc;
    }, {});

    analytics.objectAnalysis = Object.entries(groupedData).map(([scenario, items]) => ({
      scenario,
      items, // Ensure items is a flat array
    }));

    // --- Generate Prescriptive Recommendations ---
    analytics.recommendations = [];

    objectAnalysis.forEach((item) => {
      const obj = item.object ? item.object.toLowerCase() : "";
      const scenario = item.scenario ? item.scenario.toLowerCase() : "";

      // Ensure count and daysBetween are always included
      item.count = item.count || 1; // Default to 1 if missing
      item.daysBetween = item.daysBetween || 0; // Default to 0 if missing

      if (item.count >= 3 && item.daysBetween <= 14) {
        analytics.recommendations.push({
          message: `The ${obj} at ${item.reqOffice} (${item.building}, ${item.campus}) has been reported as "${scenario}" ${item.count} times in the last 2 weeks. Recommend frequent maintenance or replacement.`,
          severity: "error",
        });
      }
    });

    res.json(analytics);
  } catch (error) {
    console.error("Error during analytics:", error);
    res.status(500).send("An error occurred while fetching analytics data.");
  }
};

module.exports = { analytics };
