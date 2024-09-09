const mongoose = require('mongoose');
const JobOrder = require('../models/jobOrder');
const User = require('../models/User');
const getSemesterDates = require('../helpers/getSemesterDates');

const AddJobOrder = async (req, res) => {
  try {
    const { firstName, lastName, reqOffice, campus, building, floor, room, position, jobDesc } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ error: 'User ID is missing' });
    }

    if (!firstName || !lastName || !reqOffice || !campus || !position || !jobDesc) {
      return res.status(400).json({ error: 'Please fill all fields' });
    }

    // File information is available in req.file
    const fileUrl = req.file ? req.file.path : null;
    console.log(req.file)
    console.log(fileUrl)

    const jobOrderInfo = new JobOrder({
      userId,
      firstName,
      lastName,
      reqOffice,
      campus,
      building,
      floor,
      room,
      position,
      jobDesc,
      fileUrl, // Store the file URL/path
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
    const { priority, assignedTo, status } = req.body;
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid Job ID' });
    }

    const updateFields = {};
    if (priority) updateFields.priority = priority;
    if (status) updateFields.status = status;

    // Fetch user details if assignedTo is provided
    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (user) {
        updateFields.assignedTo = `${user.firstName} ${user.lastName}`;
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    }

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

const getAssignUsers = async (req, res) => {
  try {
    const { role, position } = req.query;
    const query = { role, position };
    const users = await User.find(query).select('firstName lastName');
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
  try {
    const { tracking } = req.body; // Expecting tracking to be an array
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid Job ID' });
    }

    const jobOrder = await JobOrder.findById(jobId);

    if (!jobOrder) {
      return res.status(404).json({ error: 'Job Order not found' });
    }

    // Update tracking array directly
    jobOrder.tracking = tracking;

    await jobOrder.save();

    res.json({ message: 'Job Order tracking updated successfully', jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
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
const getJobOrdersByDate = async (req, res) => {
  try {
    // Assuming you want to fetch data within a specific date range
    const { startDate, endDate } = req.query;

    // Aggregate job orders by date
    const jobOrdersData = await JobOrder.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Format data for the chart
    const chartData = {
      dates: jobOrdersData.map(item => `${item._id.year}-${item._id.month}-${item._id.day}`),
      counts: jobOrdersData.map(item => item.count)
    };

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching job orders data", error });
  }
};

// Controller function to get job requests by department and semester
const getJobRequestsByDepartment = async (req, res) => {
  try {
    // Get the current date and semester dates
    const now = new Date();
    const { semester, start, end } = getSemester(now);

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
          department: '$reqOffice'
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

    // Extract departments and prepare data for the chart
    const departments = Array.from(new Set(jobRequestsData.map(item => item._id.department)));
    const chartData = departments.map(department => {
      return {
        label: department,
        data: ['First Semester', 'Second Semester', 'Third Semester'].map(sem => {
          const entry = jobRequestsData.find(d => d._id.semester === sem && d._id.department === department);
          return entry ? entry.count : 0;
        })
      };
    });

    res.json({ semesters: ['First Semester', 'Second Semester', 'Third Semester'], chartData });
  } catch (error) {
    res.status(500).json({ message: "Error fetching job requests data", error });
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

    // Fetch job orders with pagination and feedback
    const totalJobOrders = await JobOrder.countDocuments();
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

// controllers/jobOrderAnalyticsController.js

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
          department: '$reqOffice'
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

    // Extract departments and prepare data for the chart
    const departments = Array.from(new Set(jobRequestsData.map(item => item._id.department)));
    const chartData = departments.map(department => {
      return {
        label: department,
        data: ['First Semester', 'Second Semester', 'Third Semester'].map(sem => {
          const entry = jobRequestsData.find(d => d._id.semester === sem && d._id.department === department);
          return entry ? entry.count : 0;
        })
      };
    });

    res.json({ semesters: ['First Semester', 'Second Semester', 'Third Semester'], chartData });
  } catch (error) {
    res.status(500).json({ message: "Error fetching job requests data", error });
  }
};

const analyzeJobOrders = async (req, res) => {
  try {
    // Normalize job descriptions and aggregate job orders by the normalized description
    const issuesData = await JobOrder.aggregate([
      {
        $match: {
          status: { $in: ["approved", "completed"] } // Filter by status
        }
      },
      {
        $addFields: {
          normalizedJobDesc: {
            $trim: { input: { $toLower: "$jobDesc" }, chars: " \t\n" } // Convert to lowercase and trim whitespace
          }
        }
      },
      {
        $group: {
          _id: "$normalizedJobDesc", // Group by the normalized job description
          originalJobDesc: { $first: "$jobDesc" }, // Keep one original description for display
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 } // Sort by count in descending order
      }
    ]);

    // Generate recommendations based on the analysis
    const recommendations = issuesData.map(issue => {
      if (issue.count >= 5) { // Example threshold for frequent issues
        return {
          issue: issue.originalJobDesc,
          recommendation: "Consider reviewing or replacing the part associated with this issue."
        };
      }
      return null;
    }).filter(rec => rec !== null);

    res.json({ issuesData, recommendations });
  } catch (error) {
    res.status(500).json({ message: "Error analyzing job orders data", error });
  }
};

const getReports = async (req, res) => {
  try {
    const { reportType, specificTicket, status, dateRange, userId, department, building, campus } = req.query;

    const query = {};

    if (specificTicket) query._id = specificTicket;
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (department) query.department = department;
    if (building) query.building = building;
    if (campus) query.campus = campus;
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(':');
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const requests = await JobOrder.find(query).lean();

    return res.json({ requests });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
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
  getJobOrdersByDate,
  getJobRequestsByDepartment,
  submitFeedback,
  getFeedbacks,
  getJobRequestsByDepartmentAndSemester,
  analyzeJobOrders,
  getReports,
};
