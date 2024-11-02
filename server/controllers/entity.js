const Campus = require('../models/Entity');

// Create a new Campus
const createCampus = async (req, res) => {
    try {
        const campus = new Campus(req.body);
        await campus.save();
        res.status(201).json(campus);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all Campuses
const getAllCampuses = async (req, res) => {
    try {
        const campuses = await Campus.find();
        res.json(campuses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a Campus
const updateCampus = async (req, res) => {
    const { campusId } = req.params;

    try {
        const campus = await Campus.findByIdAndUpdate(campusId, req.body, { new: true });
        if (!campus) {
            return res.status(404).json({ message: "Campus not found." });
        }
        res.json(campus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a Campus
const deleteCampus = async (req, res) => {
    const { campusId } = req.params;

    try {
        await Campus.findByIdAndDelete(campusId);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Create a new Building
const createBuilding = async (req, res) => {
    const { campusId } = req.params;
    const { name } = req.body;

    try {
        const campus = await Campus.findById(campusId);
        if (!campus) {
            return res.status(404).json({ message: "Campus not found." });
        }
        const newBuilding = { name };
        campus.buildings.push(newBuilding);
        await campus.save();
        res.status(201).json(newBuilding);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating building." });
    }
};

// Update a Building
const updateBuilding = async (req, res) => {
    const { campusId, buildingId } = req.params;

    try {
        const campus = await Campus.findOne({ _id: campusId, 'buildings._id': buildingId });
        if (!campus) {
            return res.status(404).json({ message: "Campus or Building not found." });
        }

        const building = campus.buildings.id(buildingId);
        building.set(req.body);
        await campus.save();
        res.json(building);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating building." });
    }
};

// Delete a Building
const deleteBuilding = async (req, res) => {
    const { campusId, buildingId } = req.params;

    try {
        const campus = await Campus.findById(campusId);
        if (!campus) {
            return res.status(404).json({ message: "Campus not found." });
        }

        campus.buildings.id(buildingId).remove();
        await campus.save();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

// Create a new Floor
const createFloor = async (req, res) => {
    const { campusId, buildingId } = req.params;
    const { number } = req.body;

    try {
        const campus = await Campus.findOne({ _id: campusId, 'buildings._id': buildingId });
        if (!campus) {
            return res.status(404).json({ message: "Campus or Building not found." });
        }

        const building = campus.buildings.id(buildingId);
        building.floors.push({ number });
        await campus.save();

        res.status(201).json(building.floors[building.floors.length - 1]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating floor." });
    }
};

// Update a Floor
const updateFloor = async (req, res) => {
    const { campusId, buildingId, floorId } = req.params;

    try {
        const campus = await Campus.findOne({ _id: campusId, 'buildings._id': buildingId });
        if (!campus) {
            return res.status(404).json({ message: "Campus or Building not found." });
        }

        const building = campus.buildings.id(buildingId);
        const floor = building.floors.id(floorId);
        floor.set(req.body);
        await campus.save();

        res.json(floor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating floor." });
    }
};

// Delete a Floor
const deleteFloor = async (req, res) => {
    const { campusId, buildingId, floorId } = req.params;

    try {
        const campus = await Campus.findOne({ _id: campusId, 'buildings._id': buildingId });
        if (!campus) {
            return res.status(404).json({ message: "Campus or Building not found." });
        }

        const building = campus.buildings.id(buildingId);
        building.floors.id(floorId).remove();
        await campus.save();

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

// Create a new Office
const createOffice = async (req, res) => {
    const { campusId, buildingId, floorId } = req.params;
    const { name } = req.body;

    try {
        const campus = await Campus.findOne({ _id: campusId, 'buildings._id': buildingId, 'buildings.floors._id': floorId });
        if (!campus) {
            return res.status(404).json({ message: "Campus, Building, or Floor not found." });
        }

        const building = campus.buildings.id(buildingId);
        const floor = building.floors.id(floorId);
        floor.offices.push({ name });
        await campus.save();

        res.status(201).json(floor.offices[floor.offices.length - 1]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating office." });
    }
};

// Update an Office
const updateOffice = async (req, res) => {
    const { campusId, buildingId, floorId, officeId } = req.params;

    try {
        const campus = await Campus.findOne({ _id: campusId, 'buildings._id': buildingId, 'buildings.floors._id': floorId });
        if (!campus) {
            return res.status(404).json({ message: "Campus, Building, or Floor not found." });
        }

        const building = campus.buildings.id(buildingId);
        const floor = building.floors.id(floorId);
        const office = floor.offices.id(officeId);
        office.set(req.body);
        await campus.save();

        res.json(office);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating office." });
    }
};

// Delete an Office
const deleteOffice = async (req, res) => {
    const { campusId, buildingId, floorId, officeId } = req.params;

    try {
        const campus = await Campus.findOne({ _id: campusId, 'buildings._id': buildingId, 'buildings.floors._id': floorId });
        if (!campus) {
            return res.status(404).json({ message: "Campus, Building, or Floor not found." });
        }

        const building = campus.buildings.id(buildingId);
        const floor = building.floors.id(floorId);
        floor.offices.id(officeId).remove();
        await campus.save();

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

// Fetch all offices from the database
const getOffices = async (req, res) => {
    try {
      const campuses = await Campus.find().populate({
        path: 'buildings.floors.offices', // Populate the offices embedded within floors
        select: 'name' // Select only the name field
      });
  
      // Extract offices from the nested structure
      const offices = [];
      campuses.forEach(campus => {
        campus.buildings.forEach(building => {
          building.floors.forEach(floor => {
            offices.push(...floor.offices);
          });
        });
      });
  
      res.status(200).json(offices); // Return the offices as a JSON response
    } catch (error) {
      console.error("Error fetching offices:", error);
      res.status(500).json({ error: "Failed to fetch offices" });
    }
  };

module.exports = {
    createCampus,
    getAllCampuses,
    updateCampus,
    deleteCampus,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    createFloor,
    updateFloor,
    deleteFloor,
    createOffice,
    updateOffice,
    deleteOffice,
    getOffices
};
