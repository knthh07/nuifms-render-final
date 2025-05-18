const Campus = require('../models/Entity');

// Helper function for error handling
const handleError = (res, error, context) => {
    console.error(`Error in ${context}:`, error);
    res.status(500).json({ error: `An error occurred while ${context}. Please try again later.` });
};

// Helper function for updating nested documents
const updateNestedDocument = async (res, campusId, nestedPath, documentId, updateData, context) => {
    try {
        const campus = await Campus.findById(campusId);
        if (!campus) {
            return res.status(404).json({ message: `${context} not found.` });
        }

        // Split the nested path (e.g., 'buildings.floors' -> ['buildings', 'floors'])
        const pathSegments = nestedPath.split('.');

        // Traverse the nested path to find the array
        let nestedArray = campus;
        for (const segment of pathSegments) {
            nestedArray = nestedArray[segment];
        }

        // Find the document in the nested array
        const document = nestedArray.id(documentId);
        if (!document) {
            return res.status(404).json({ message: `${context} not found.` });
        }

        // Update the document
        document.set(updateData);
        await campus.save();

        res.json(document);
    } catch (error) {
        handleError(res, error, context);
    }
};

// Create a new Campus
const createCampus = async (req, res) => {
    try {
        const campus = new Campus(req.body);
        await campus.save();
        res.status(201).json(campus);
    } catch (error) {
        handleError(res, error, 'creating campus');
    }
};

// Get all Campuses
const getAllCampuses = async (req, res) => {
    try {
        const campuses = await Campus.find();
        res.json(campuses);
    } catch (error) {
        handleError(res, error, 'fetching campuses');
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
        handleError(res, error, 'updating campus');
    }
};

// Delete a Campus
const deleteCampus = async (req, res) => {
    const { campusId } = req.params;

    try {
        await Campus.findByIdAndDelete(campusId);
        res.status(204).send();
    } catch (error) {
        handleError(res, error, 'deleting campus');
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
        handleError(res, error, 'creating building');
    }
};

// Update a Building
const updateBuilding = async (req, res) => {
    const { campusId, buildingId } = req.params;
    await updateNestedDocument(res, campusId, 'buildings', buildingId, req.body, 'updating building');
};

// Delete a Building
const deleteBuilding = async (req, res) => {
    const { campusId, buildingId } = req.params;

    try {
        const campus = await Campus.findById(campusId);
        if (!campus) {
            return res.status(404).json({ message: "Campus not found." });
        }

        // Remove the building by ID
        campus.buildings.pull(buildingId);
        await campus.save();

        res.status(204).send();
    } catch (error) {
        handleError(res, error, 'deleting building');
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
        handleError(res, error, 'creating floor');
    }
};

// Update a Floor
const updateFloor = async (req, res) => {
    const { campusId, buildingId, floorId } = req.params;

    try {
        const campus = await Campus.findById(campusId);
        if (!campus) {
            return res.status(404).json({ message: "Campus not found." });
        }

        // Find the correct building
        const building = campus.buildings.id(buildingId);
        if (!building) {
            return res.status(404).json({ message: "Building not found." });
        }

        // Find the floor
        const floor = building.floors.id(floorId);
        if (!floor) {
            return res.status(404).json({ message: "Floor not found." });
        }

        // Update the floor
        floor.set(req.body);
        await campus.save();

        res.json(floor);
    } catch (error) {
        handleError(res, error, 'updating floor');
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
        if (!building) {
            return res.status(404).json({ message: "Building not found." });
        }

        // Remove the floor by ID
        building.floors.pull(floorId);
        await campus.save();

        res.status(204).send();
    } catch (error) {
        handleError(res, error, 'deleting floor');
    }
};

// Create a new Office with allowed positions
const createOffice = async (req, res) => {
    const { campusId, buildingId, floorId } = req.params;
    const { name, allowedPositions } = req.body;

    try {
        const campus = await Campus.findOne({ _id: campusId, 'buildings._id': buildingId, 'buildings.floors._id': floorId });
        if (!campus) {
            return res.status(404).json({ message: "Campus, Building, or Floor not found." });
        }

        const building = campus.buildings.id(buildingId);
        const floor = building.floors.id(floorId);

        // Validate allowed positions
        const validPositions = ['Faculty', 'Facilities Employee', 'ASP'];
        if (!Array.isArray(allowedPositions) || !allowedPositions.every(pos => validPositions.includes(pos))) {
            return res.status(400).json({ message: "Invalid allowed positions provided." });
        }

        // Add office with allowed positions
        floor.offices.push({ name, allowedPositions });
        await campus.save();

        res.status(201).json(floor.offices[floor.offices.length - 1]);
    } catch (error) {
        handleError(res, error, 'creating office');
    }
};

// Update an Office (including allowed positions)
const updateOffice = async (req, res) => {
    const { campusId, buildingId, floorId, officeId } = req.params;
    const { name, allowedPositions } = req.body;

    try {
        const campus = await Campus.findOne({ _id: campusId, 'buildings._id': buildingId, 'buildings.floors._id': floorId });
        if (!campus) {
            return res.status(404).json({ message: "Campus, Building, or Floor not found." });
        }

        const building = campus.buildings.id(buildingId);
        const floor = building.floors.id(floorId);
        const office = floor.offices.id(officeId);

        if (!office) {
            return res.status(404).json({ message: "Office not found." });
        }

        // Update name if provided
        if (name) office.name = name;

        // Validate and update allowed positions if provided
        if (allowedPositions) {
            const validPositions = ['Faculty', 'Facilities Employee', 'ASP'];
            if (!Array.isArray(allowedPositions) || !allowedPositions.every(pos => validPositions.includes(pos))) {
                return res.status(400).json({ message: "Invalid allowed positions provided." });
            }
            office.allowedPositions = allowedPositions;
        }

        await campus.save();
        res.json(office);
    } catch (error) {
        handleError(res, error, 'updating office');
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

        if (!floor) {
            return res.status(404).json({ message: "Floor not found." });
        }

        // Remove the office by ID
        floor.offices.pull(officeId);
        await campus.save();

        res.status(204).send();
    } catch (error) {
        handleError(res, error, 'deleting office');
    }
};

// Fetch all offices from the database
const getOffices = async (req, res) => {
    const { position } = req.query;

    try {
        const campuses = await Campus.find();
        let offices = campuses.flatMap(campus =>
            campus.buildings.flatMap(building =>
                building.floors.flatMap(floor => floor.offices)
            )
        );

        if (position) {
            offices = offices.filter(office => office.allowedPositions.includes(position));
        }

        res.status(200).json(offices);
    } catch (error) {
        handleError(res, error, 'fetching offices');
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