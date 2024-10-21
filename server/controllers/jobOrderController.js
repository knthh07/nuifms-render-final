const mongoose = require('mongoose');
const JobOrder = require('../models/jobOrder');
const Account = require('../models/Account');
const UserInfo = require('../models/UserInfo');
const { sendGeneralEmail } = require('../helpers/SendEmail');  // Import the general email function
const getSemesterDates = require('../helpers/getSemesterDates');

const AddJobOrder = async (req, res) => {
  try {
    const { jobType, firstName, lastName, reqOffice, campus, building, floor, position, jobDesc, scenario, object, dateOfRequest } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ error: 'User ID is missing' });
    }

    if (!jobType || !firstName || !lastName || !reqOffice || !campus || !position || !jobDesc || !dateOfRequest) {
      return res.status(400).json({ error: 'Please fill all fields' });
    }

    // File information is available in req.file
    const fileUrl = req.file ? req.file.path : null;

    const jobOrderInfo = new JobOrder({
      userId,
      jobType,
      firstName,
      lastName,
      reqOffice,
      campus,
      building,
      floor,
      position,
      jobDesc,
      scenario,
      object,
      fileUrl, // Store the file URL/path
      dateOfRequest,
    });

    await jobOrderInfo.save();
    return res.status(201).json(jobOrderInfo);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 9;
    const skip = (page - 1) * perPage;

    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = { status: { $nin: ['approved', 'rejected', 'completed'] } };

    // Apply filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.userId) query.userId = req.query.userId;
    if (req.query.dateRange) {
      const [startDate, endDate] = req.query.dateRange.split(':');
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // If user is not an admin, limit the query to their own requests

    const totalRequests = await JobOrder.countDocuments(query);
    const totalPages = Math.ceil(totalRequests / perPage);

    const requests = await JobOrder.find(query, '-updatedAt -__v')
      .skip(skip)
      .limit(perPage)
      .lean();

    return res.json({ requests, totalPages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const approveRequest = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid Job ID' });
    }

    const jobOrder = await JobOrder.findByIdAndUpdate(jobId, { status: 'approved' }, { new: true });

    if (!jobOrder) {
      return res.status(404).json({ error: 'Job Order not found' });
    }

    res.json({ message: 'Job Order approved successfully', jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid Job ID' });
    }

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const jobOrder = await JobOrder.findByIdAndUpdate(
      jobId,
      {
        status: 'rejected',
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!jobOrder) {
      return res.status(404).json({ error: 'Job Order not found' });
    }

    res.json({ message: 'Job Order rejected and archived successfully', jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getJobOrders = async (req, res) => {
  try {
    const { page = 1, status, lastName, dateRange, filterBy } = req.query;
    const perPage = 8;
    const skip = (page - 1) * perPage;

    // Build the query object based on the provided filters
    const query = {};

    if (status) {
      query.status = status;
    }

    if (lastName) {
      // Assuming lastName field in your schema is 'lastName'
      query.lastName = new RegExp(lastName, 'i'); // Case-insensitive search
    }

    if (dateRange && filterBy) {
      const [startDate, endDate] = dateRange.split(':');

      if (filterBy === 'day') {
        query.createdAt = {
          $gte: new Date(`${startDate}T00:00:00.000Z`),
          $lt: new Date(`${endDate}T23:59:59.999Z`),
        };
      } else if (filterBy === 'month') {
        query.createdAt = {
          $gte: new Date(`${startDate}-01T00:00:00.000Z`),
          $lt: new Date(`${endDate}-31T23:59:59.999Z`)
        };
      } else if (filterBy === 'year') {
        query.createdAt = {
          $gte: new Date(`${startDate}-01-01T00:00:00.000Z`),
          $lt: new Date(`${endDate}-12-31T23:59:59.999Z`)
        };
      }
    }

    // Count total documents matching the query
    const totalRequests = await JobOrder.countDocuments(query);
    const totalPages = Math.ceil(totalRequests / perPage);

    // Fetch the job orders with pagination and tracking information
    const requests = await JobOrder.find(query)
      .skip(skip)
      .limit(perPage)
      .lean() // Use lean to get plain JavaScript objects
      .exec();

    // Include tracking information for each job order
    const jobOrdersWithTracking = requests.map(order => ({
      ...order,
      tracking: order.tracking || [],
    }));

    return res.json({ requests: jobOrdersWithTracking, totalPages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const updateJobOrder = async (req, res) => {
  try {
    const { priority, assignedTo, status, dateAssigned, scheduleWork, dateFrom, dateTo, costRequired, chargeTo } = req.body;
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid Job ID' });
    }

    const updateFields = {};
    if (priority) updateFields.priority = priority;
    if (status) updateFields.status = status;

    // Fetch the current user's email from the token (assuming req.user.email contains the email)
    const userEmail = req.user.email;

    // Fetch user details from UserInfo collection using the email
    const userInfo = await UserInfo.findOne({ email: userEmail });
    if (!userInfo) {
      return res.status(404).json({ error: 'User info not found' });
    }

    // Fetch job order details if assignedTo is provided
    if (assignedTo) {
      const user = await UserInfo.findOne({ email: assignedTo });
      if (user) {
        updateFields.assignedTo = `${user.firstName} ${user.lastName}`;
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    // Update Physical Facilities Remarks fields if provided
    if (dateAssigned) updateFields.dateAssigned = dateAssigned;
    if (scheduleWork) updateFields.scheduleWork = scheduleWork;
    if (dateFrom) updateFields.dateFrom = dateFrom;
    if (dateTo) updateFields.dateTo = dateTo;
    if (costRequired) updateFields.costRequired = costRequired;
    if (chargeTo) updateFields.chargeTo = chargeTo;

    const jobOrder = await JobOrder.findByIdAndUpdate(jobId, updateFields, { new: true });

    if (!jobOrder) {
      return res.status(404).json({ error: 'Job Order not found' });
    }

    res.json({ message: 'Job Order updated successfully', jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteJobOrder = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid Job ID' });
    }

    const jobOrder = await JobOrder.findByIdAndUpdate(jobId, { status: 'rejected' }, { new: true });

    if (!jobOrder) {
      return res.status(404).json({ error: 'Job Order not found' });
    }

    res.json({ message: 'Job Order archived successfully', jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const completeJobOrder = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid Job ID' });
    }

    const jobOrder = await JobOrder.findByIdAndUpdate(jobId, { status: 'completed' }, { new: true });

    if (!jobOrder) {
      return res.status(404).json({ error: 'Job Order not found' });
    }

    res.json({ message: 'Job Order marked as completed successfully', jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// di nagagamit
const getAssignUsers = async (req, res) => {
  try {
    const { role, position } = req.query;
    const query = { role, position };
    const users = await Account.find(query).select('firstName lastName');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getApplicationCount = async (req, res) => {
  try {
    const query = { status: { $nin: ['approved', 'rejected'] } };

    // Apply filters if needed
    if (req.query.status) query.status = req.query.status;
    if (req.query.userId) query.userId = req.query.userId;
    if (req.query.dateRange) {
      const [startDate, endDate] = req.query.dateRange.split(':');
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const count = await JobOrder.countDocuments(query);
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateJobOrderTracking = async (req, res) => {
  const { id } = req.params;
  const { tracking } = req.body; // Get the tracking array

  try {
    // Find the job order by ID
    const jobOrder = await JobOrder.findById(id);
    if (!jobOrder) {
      return res.status(404).json({ message: 'Job order not found' });
    }

    // Ensure the tracking array has at least one entry to get status and note
    if (tracking && tracking.length > 0) {
      const { status, note } = tracking[tracking.length - 1]; // Get the latest entry

      // Update the tracking array
      jobOrder.tracking.push({ status, note });
      await jobOrder.save();

      // Find the user by userId to get their email
      const user = await Account.findById(jobOrder.userId);
      if (user && user.email) {
        // Prepare email details
        const subject = `Update on Your Job Order ${jobOrder._id}`;
        const message = `The status of your job order has been updated to: ${status}. Note: ${note}`;

        // Send the email
        await sendGeneralEmail(user.email, subject, message);
      }
    } else {
      return res.status(400).json({ message: 'Tracking information is required' });
    }

    return res.status(200).json({ message: 'Job order updated and email sent' });
  } catch (error) {
    console.error('Error updating job order:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getJobOrderTracking = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid Job ID' });
    }

    const jobOrder = await JobOrder.findById(jobId).select('tracking');

    if (!jobOrder) {
      return res.status(404).json({ error: 'Job Order not found' });
    }

    res.json({ jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Controller function to get job orders count by date
const getUserJobOrdersByDate = async (req, res) => {
  try {
    const userId = req.user.id; // Get the logged-in user's ID from the request object
    const { start, end } = getSemesterDates(new Date()); // Get current semester dates

    // Aggregate job orders by date for the logged-in user
    const jobOrdersData = await JobOrder.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id": 1 },
      },
    ]);

    // Format data for the chart
    const chartData = {
      dates: jobOrdersData.map(item => `${item._id.year}-${item._id.month}-${item._id.day}`),
      counts: jobOrdersData.map(item => item.count),
    };

    res.json(chartData); // Return chart data
  } catch (error) {
    console.error('Error fetching user job orders:', error);
    res.status(500).json({ message: "Error fetching job orders", error: error.message });
  }
};


// Controller function to get job requests by department and semester
const getUserJobOrders = async (req, res) => {
  try {
    const userId = req.user.id; // Get the logged-in user's ID from the request object
    const { semester, start, end } = getSemesterDates(new Date()); // Get current semester dates

    // Fetch the count of job orders for the logged-in user for the specified semester
    const jobOrderCount = await JobOrder.countDocuments({
      userId: userId,
      createdAt: {
        $gte: start,
        $lte: end
      }
    });

    // Send the count back in the response
    res.json({
      userId,
      semester,
      jobOrderCount,
    });
  } catch (error) {
    console.error('Error fetching user job orders:', error);
    res.status(500).json({ message: "Error fetching job orders", error: error.message });
  }
};

// controllers/jobOrderController.js
const submitFeedback = async (req, res) => {
  try {
    const jobOrderId = req.params.id; // Ensure this matches your route
    const { feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobOrderId)) {
      return res.status(400).json({ error: 'Invalid Job ID' });
    }

    const jobOrder = await JobOrder.findById(jobOrderId);

    if (!jobOrder) {
      return res.status(404).json({ error: 'Job order not found' });
    }

    jobOrder.feedback = feedback;
    jobOrder.feedbackSubmitted = true;

    jobOrder.tracking.forEach(tracking => {
      const validStatuses = ['on-hold', 'ongoing', 'completed', 'pending'];
      if (!validStatuses.includes(tracking.status)) {
        tracking.status = 'pending'; // Default or handle invalid status
      }
    });

    await jobOrder.save();

    res.json({ message: 'Feedback submitted successfully', jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getFeedbacks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const perPage = parseInt(limit, 10);
    const skip = (page - 1) * perPage;

    // Count only job orders with feedback
    const totalJobOrders = await JobOrder.countDocuments({ feedback: { $ne: '' } });

    const jobOrders = await JobOrder.find({ feedback: { $ne: '' } }) // Only fetch job orders with feedback
      .skip(skip)
      .limit(perPage)
      .lean()
      .exec();

    const totalPages = Math.ceil(totalJobOrders / perPage);

    // Map the job orders to include feedback details
    const feedbacks = jobOrders.map(order => ({
      _id: order._id.toString(), // Ensure _id is a string
      firstName: order.firstName,
      lastName: order.lastName,
      jobDesc: order.jobDesc,
      date: order.createdAt, // Use createdAt or any other date field
      feedback: order.feedback
    }));

    return res.json({ feedbacks, totalPages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getJobRequestsByDepartmentAndSemester = async (req, res) => {
  try {
    const now = new Date();
    const { semester, start, end } = getSemesterDates(now);

    // Aggregate job orders by department and semester
    const jobRequestsData = await JobOrder.aggregate([
      {
        $project: {
          semester: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", start] },
                  { $lte: ["$createdAt", end] }
                ]
              },
              semester,
              'Unknown'
            ]
          },
          department: '$reqOffice',
          status: '$status'
        }
      },
      {
        $group: {
          _id: { semester: "$semester", department: "$department" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.semester": 1 }
      }
    ]);

    // Prepare a flattened data structure for the chart
    const chartData = [];
    const semesters = ['First Semester', 'Second Semester', 'Third Semester'];

    // Initialize chartData for each semester
    semesters.forEach(sem => {
      const semesterData = { semester: sem }; // Start with the semester label
      jobRequestsData.forEach(entry => {
        if (entry._id.semester === sem) {
          semesterData[entry._id.department] = entry.count; // Add department count
        } else if (!semesterData[entry._id.department]) {
          semesterData[entry._id.department] = 0; // Initialize to 0 if no entries
        }
      });
      chartData.push(semesterData);
    });

    // Calculate total job orders by department
    const departmentCounts = jobRequestsData.reduce((acc, curr) => {
      const department = curr._id.department;
      acc[department] = (acc[department] || 0) + curr.count;
      return acc;
    }, {});

    res.json({
      semesters,
      chartData,
      departmentCounts // Include department job order counts
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching job requests data", error });
  }
};

const analyzeJobOrders = async (req, res) => {
  try {
    // Find recurring job orders with the 'approved' status, grouped by office, building, floor, scenario, and object
    const recurringIssues = await JobOrder.aggregate([
      {
        $match: { status: 'approved' } // Filter only 'approved' job orders
      },
      {
        $group: {
          _id: {
            reqOffice: '$reqOffice',
            building: '$building', // Group by building
            floor: '$floor',       // Group by floor
            scenario: '$scenario',
            object: '$object'
          },
          count: { $sum: 1 },
        }
      },
      {
        $match: { count: { $gte: 3 } } // Threshold for recommendation
      }
    ]);

    const recommendations = [];

    // Define possible dynamic actions based on the scenario and object
    const actionMapping = {
      'Broken': {
        'Computer': 'Consider upgrading or repairing the computer systems',
        'Projector': 'Repair or replace the projectors',
        'Air conditioner': 'Schedule maintenance or replacement of air conditioners',
        'Light switch': 'Inspect and repair the light switches',
        'Desk': 'Replace or fix the desks',
        'Elevator': 'Schedule maintenance for elevators',
        'Whiteboard': 'Replace or fix the whiteboards',
        'Printer': 'Service or replace the printers',
      },
      'Busted': {
        'Fuse': 'Check the wiring and replace fuses as necessary',
        'Light bulb': 'Replace the light bulbs with energy-efficient options',
        'Monitor': 'Repair or replace the monitors',
        'Electric outlet': 'Inspect and fix electrical outlets',
        'Security camera': 'Check and repair the security camera systems',
        'Speaker system': 'Repair or replace speaker systems',
        'Router': 'Upgrade or troubleshoot the routers',
        'Refrigerator': 'Service or replace the refrigerators',
      },
      'Slippery': {
        'Floor': 'Apply anti-slip coatings or mats',
        'Stairs': 'Install anti-slip strips or handrails',
        'Entrance': 'Improve drainage or install mats at entrances',
        'Bathroom tiles': 'Use anti-slip treatments on bathroom tiles',
        'Balcony': 'Install safety measures to prevent slips on balconies',
      },
      'Leaking': {
        'Faucet': 'Fix or replace leaking faucets',
        'Pipes': 'Schedule a full plumbing inspection and repairs',
        'Roof': 'Repair or replace leaking roof sections',
        'Water dispenser': 'Inspect and fix or replace water dispensers',
        'Sink': 'Fix or replace sinks with leakage issues',
        'Ceiling': 'Investigate and repair ceiling leaks',
      },
      'Clogged': {
        'Toilet': 'Unclog toilets and check for drainage issues',
        'Drain': 'Clear the drains and consider routine cleaning',
        'Sink': 'Unclog and maintain the sinks',
        'Gutter': 'Clean and maintain the gutters to prevent clogging',
        'AC Vent': 'Clean or replace air conditioning vents',
      },
      'Noisy': {
        'Fan': 'Lubricate or replace noisy fans',
        'Door': 'Fix door hinges or replace noisy doors',
        'Ventilation system': 'Inspect and repair ventilation systems',
        'Generator': 'Service or replace noisy generators',
        'AC unit': 'Maintain or replace noisy air conditioning units',
      },
      'Not Working': {
        'Printer': 'Service or replace the printers',
        'Photocopier': 'Repair or replace photocopiers',
        'Door lock': 'Fix or replace non-functioning door locks',
        'Smartboard': 'Troubleshoot or replace smartboards',
        'Projector': 'Repair or replace projectors',
        'Microphone': 'Service or replace malfunctioning microphones',
        'Intercom system': 'Check and repair intercom systems',
      },
      'Cracked': {
        'Window': 'Replace or repair cracked windows',
        'Door': 'Fix or replace cracked doors',
        'Floor tile': 'Replace cracked floor tiles',
        'Wall': 'Repair cracks in walls',
        'Whiteboard': 'Fix or replace cracked whiteboards',
      },
      'Burnt Out': {
        'Light bulb': 'Replace burnt-out bulbs with longer-lasting ones',
        'Electric wiring': 'Inspect and replace faulty electrical wiring',
        'Fuse box': 'Service or replace fuse boxes',
        'Outlet': 'Repair or replace burnt-out outlets',
        'Extension cord': 'Replace damaged extension cords',
      },
      'Loose': {
        'Door knob': 'Tighten or replace loose door knobs',
        'Cabinet handle': 'Fix or replace loose cabinet handles',
        'Table leg': 'Repair or replace wobbly table legs',
        'Chair screws': 'Tighten screws or replace parts of chairs',
        'Window lock': 'Fix or replace loose window locks',
      }
    };

    // Generate recommendations based on recurring issues
    recurringIssues.forEach(issue => {
      const { reqOffice, building, floor, scenario, object } = issue._id;
      const action = actionMapping[scenario]?.[object] || 'No specific action available';
      recommendations.push({
        office: reqOffice,
        building,
        floor,
        scenario,
        object,
        action,
        occurrences: issue.count,
      });
    });

    res.json({ recurringIssues, recommendations });
  } catch (error) {
    res.status(500).json({ message: 'Error analyzing job orders', error });
  }
};

const getReports = async (req, res) => {
  try {
    // Destructure filters from query parameters
    const { reportType, specificTicket, status, dateRange, userId, department, building, campus } = req.query;

    // Build the query object based on the provided filters
    const query = {};

    if (specificTicket) { query._id = specificTicket; }
    if (status) { query.status = status; }
    if (userId) { query.userId = userId; }
    if (department) { query.department = department; }
    if (building) { query.building = building; }
    if (campus) { query.campus = campus; }
    if (dateRange) {
      const [start, end] = dateRange.split(':');
      query.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }

    // Fetch job orders based on the constructed query
    const requests = await JobOrder.find(query);

    // Return the fetched job orders in the response
    res.status(200).json({ requests });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'An error occurred while fetching reports.' });
  }
};

module.exports = {
  AddJobOrder,
  getRequests,
  approveRequest,
  rejectRequest,
  getJobOrders,
  updateJobOrder,
  deleteJobOrder,
  completeJobOrder,
  getAssignUsers,
  getApplicationCount,
  updateJobOrderTracking,
  getJobOrderTracking,
  getUserJobOrdersByDate,
  getUserJobOrders,
  submitFeedback,
  getFeedbacks,
  getJobRequestsByDepartmentAndSemester,
  analyzeJobOrders,
  getReports,
};
