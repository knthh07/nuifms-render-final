const mongoose = require("mongoose");
const JobOrder = require("../models/jobOrder");
const Account = require("../models/Account");
const UserInfo = require("../models/UserInfo");
const { sendGeneralEmail } = require("../helpers/SendEmail");
const getSemesterDates = require("../helpers/getSemesterDates");

const AddJobOrder = async (req, res) => {
  try {
    const { jobType, firstName, lastName, reqOffice, position, jobDesc, scenario, object, dateOfRequest, dateFrom, dateTo } = req.body;
    const userId = req.user.id;

    if (!userId) return res.status(401).json({ error: "User ID is missing" });
    if (!jobType || !firstName || !lastName || !reqOffice || !position || !jobDesc || !dateOfRequest || !dateFrom || !dateTo) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    const fileUrl = req.file ? req.file.path : null;
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().slice(-2);
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");

    const todayStart = new Date(currentDate.setHours(0, 0, 0, 0));
    const todayEnd = new Date(currentDate.setHours(23, 59, 59, 999));
    const jobOrderCount = await JobOrder.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } });
    const jobOrderNumber = `${year}-${month}${day}${String(jobOrderCount + 1).padStart(2, "0")}`;

    // Set status to 'ongoing' if position is 'Facilities Employee'
    const status = position === 'Facilities Employee' ? 'ongoing' : 'pending';

    const jobOrderInfo = new JobOrder({
      userId, jobType, firstName, lastName, reqOffice, position, jobDesc, scenario, object, fileUrl,
      dateOfRequest, dateFrom, dateTo, jobOrderNumber, status
    });

    await jobOrderInfo.save();
    return res.status(201).json(jobOrderInfo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

const getRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 25;
    const skip = (page - 1) * perPage;
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const query = { status: { $nin: ["ongoing", "rejected", "completed", "notCompleted"] } };
    if (req.query.status) query.status = req.query.status;
    if (req.query.userId) query.userId = req.query.userId;
    if (req.query.dateRange) {
      const [startDate, endDate] = req.query.dateRange.split(":");
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const totalRequests = await JobOrder.countDocuments(query);
    const totalPages = Math.ceil(totalRequests / perPage);
    const requests = await JobOrder.find(query)
      .populate("campus", "name").populate("building", "name").populate("floor", "number").populate("reqOffice", "name")
      .skip(skip).limit(perPage).lean();

    return res.json({ requests, totalPages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

const approveRequest = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(jobId)) return res.status(400).json({ error: "Invalid Job ID" });

    const jobOrder = await JobOrder.findByIdAndUpdate(jobId, { status: "ongoing" }, { new: true });
    if (!jobOrder) return res.status(404).json({ error: "Job Order not found" });

    res.json({ message: "Job Order approved successfully", jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateJobOrder = async (req, res) => {
  try {
    const { urgency, assignedTo, status, dateAssigned } = req.body;
    const jobId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(jobId)) return res.status(400).json({ error: "Invalid Job ID" });

    const updateFields = {};
    if (urgency) updateFields.urgency = urgency;
    if (status) updateFields.status = status;
    if (assignedTo) {
      const user = await UserInfo.findOne({ email: assignedTo });
      if (user) updateFields.assignedTo = `${user.firstName} ${user.lastName}`;
      else return res.status(404).json({ error: "User not found" });
    }
    if (dateAssigned) updateFields.dateAssigned = dateAssigned;

    const jobOrder = await JobOrder.findByIdAndUpdate(jobId, updateFields, { new: true });
    if (!jobOrder) return res.status(404).json({ error: "Job Order not found" });

    const user = await Account.findById(jobOrder.userId);
    if (user?.email) {
      const subject = `Update on Your Job Order: ${jobOrder.jobOrderNumber}`;
      const message = `Your job order with the reference number **${jobOrder.jobOrderNumber}** has been updated...`;
      await sendGeneralEmail(user.email, subject, message);
    }

    res.json({ message: "Job Order updated successfully with notification", jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { reason } = req.body;
    if (!mongoose.Types.ObjectId.isValid(jobId)) return res.status(400).json({ error: "Invalid Job ID" });
    if (!reason) return res.status(400).json({ error: "Rejection reason is required" });

    const jobOrder = await JobOrder.findByIdAndUpdate(jobId, { status: "rejected", rejectionReason: reason }, { new: true });
    if (!jobOrder) return res.status(404).json({ error: "Job Order not found" });

    res.json({ message: "Job Order rejected and archived successfully", jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getJobOrders = async (req, res) => {
  try {
    const {
      page = 1,
      jobOrderNumber,
      jobDescription,
      assignedTo,
      urgency,
      dateSubmittedFrom,
      dateSubmittedTo,
      dateCompletedFrom,
      dateCompletedTo,
      status
    } = req.query;

    const perPage = 10; // Adjust as needed
    const skip = (page - 1) * perPage;
    const query = {};

    // Text search filters
    if (jobOrderNumber) query.jobOrderNumber = new RegExp(jobOrderNumber, 'i');
    if (jobDescription) query.jobDescription = new RegExp(jobDescription, 'i');
    if (assignedTo) query.assignedTo = new RegExp(assignedTo, 'i');

    // Exact match filters
    if (urgency) query.urgency = urgency;
    if (status) query.status = status;

    // Date range filters
    if (dateSubmittedFrom || dateSubmittedTo) {
      query.createdAt = {};
      if (dateSubmittedFrom) query.createdAt.$gte = new Date(dateSubmittedFrom);
      if (dateSubmittedTo) query.createdAt.$lte = new Date(dateSubmittedTo);
    }

    if (dateCompletedFrom || dateCompletedTo) {
      query.updatedAt = {};
      if (dateCompletedFrom) query.updatedAt.$gte = new Date(dateCompletedFrom);
      if (dateCompletedTo) query.updatedAt.$lte = new Date(dateCompletedTo);
    }

    const [totalRequests, requests] = await Promise.all([
      JobOrder.countDocuments(query),
      JobOrder.find(query)
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(perPage)
        .lean()
        .exec()
    ]);

    const totalPages = Math.ceil(totalRequests / perPage);

    return res.json({
      success: true,
      requests: requests.map(order => ({
        ...order,
        tracking: order.tracking || []
      })),
      totalPages,
      totalRequests
    });

  } catch (error) {
    console.error('Error fetching job orders:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

const followUpJobOrder = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(jobId)) return res.status(400).json({ error: "Invalid Job ID" });

    const jobOrder = await JobOrder.findById(jobId);
    if (!jobOrder) return res.status(404).json({ error: "Job Order not found" });

    const admin = await Account.findOne({ role: "admin" });
    const superAdmin = await Account.findOne({ role: "superadmin" });
    const subject = `Follow-Up Request for Job Order: ${jobOrder.jobOrderNumber}`;
    const message = `A follow-up request has been submitted for the job order with the reference number **${jobOrder.jobOrderNumber}**...`;

    const recipients = [];
    if (admin?.email) recipients.push(admin.email);
    if (superAdmin?.email) recipients.push(superAdmin.email);
    if (recipients.length > 0) await sendGeneralEmail(recipients, subject, message);

    res.json({ message: "Follow-up request processed successfully", jobOrder });
  } catch (error) {
    console.error("Error in followUpJobOrder:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getJobOrdersArchive = async (req, res) => {
  try {
    const { page = 1, status, lastName, dateRange, filterBy } = req.query;
    const perPage = 25;
    const skip = (page - 1) * perPage;
    const query = { status: { $nin: ["ongoing", "pending"] } };

    if (status) query.status = status;
    if (lastName) query.lastName = new RegExp(lastName, "i");
    if (dateRange && filterBy) {
      const [startDate, endDate] = dateRange.split(":");
      if (filterBy === "day") query.createdAt = { $gte: new Date(`${startDate}T00:00:00.000Z`), $lt: new Date(`${endDate}T23:59:59.999Z`) };
      else if (filterBy === "month") query.createdAt = { $gte: new Date(`${startDate}-01T00:00:00.000Z`), $lt: new Date(`${endDate}-31T23:59:59.999Z`) };
      else if (filterBy === "year") query.createdAt = { $gte: new Date(`${startDate}-01-01T00:00:00.000Z`), $lt: new Date(`${endDate}-12-31T23:59:59.999Z`) };
    }

    const totalRequests = await JobOrder.countDocuments(query);
    const totalPages = Math.ceil(totalRequests / perPage);
    const requests = await JobOrder.find(query).skip(skip).limit(perPage).lean().exec();
    const jobOrdersWithTracking = requests.map((order) => ({ ...order, tracking: order.tracking || [] }));

    return res.json({ requests: jobOrdersWithTracking, totalPages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

const completeWithRemarks = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { remarks } = req.body;
    const userId = req.user.id; // Assuming you have user info in req.user

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: "Invalid Job ID" });
    }

    const update = {
      status: "completed",
      remarks,
      updatedAt: new Date(),
      $push: {
        tracking: {
          date: new Date(),
          status: "completed",
          note: `Completed with remarks: ${remarks}`,
          adminName: req.user.name,
          adminId: userId
        }
      }
    };

    const jobOrder = await JobOrder.findByIdAndUpdate(jobId, update, { new: true });
    if (!jobOrder) {
      return res.status(404).json({ error: "Job Order not found" });
    }

    res.json({
      message: "Job Order completed successfully",
      jobOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const completeJobOrder = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(jobId)) return res.status(400).json({ error: "Invalid Job ID" });

    const jobOrder = await JobOrder.findByIdAndUpdate(jobId, { status: "completed" }, { new: true });
    if (!jobOrder) return res.status(404).json({ error: "Job Order not found" });

    res.json({ message: "Job Order marked as completed successfully", jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getAssignUsers = async (req, res) => {
  try {
    const { role, position } = req.query;
    const users = await Account.find({ role, position }).select("firstName lastName");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getApplicationCount = async (req, res) => {
  try {
    const query = { status: { $nin: ["ongoing", "rejected"] } };
    if (req.query.status) query.status = req.query.status;
    if (req.query.userId) query.userId = req.query.userId;
    if (req.query.dateRange) {
      const [startDate, endDate] = req.query.dateRange.split(":");
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const count = await JobOrder.countDocuments(query);
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateJobOrderTracking = async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const adminName = req.user.name;
  const validStatuses = ['on-hold', 'ongoing', 'completed', 'pending', 'notCompleted'];

  try {
    const jobOrder = await JobOrder.findById(id);
    if (!jobOrder) return res.status(404).json({ message: 'Job order not found' });

    const newStatus = status && validStatuses.includes(status.toLowerCase()) ? status.toLowerCase() : 'pending';
    const newNote = note || 'No note provided';

    jobOrder.tracking.push({ date: new Date(), status: newStatus, note: newNote, adminName });
    await jobOrder.save();

    return res.status(200).json({ message: 'Job order tracking updated successfully', jobOrder });
  } catch (error) {
    console.error('Error updating job order tracking:', error);
    return res.status(500).json({ message: 'Server error while updating tracking' });
  }
};

const getJobOrderTracking = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(jobId)) return res.status(400).json({ error: "Invalid Job ID" });

    const jobOrder = await JobOrder.findById(jobId).select("tracking");
    if (!jobOrder) return res.status(404).json({ error: "Job Order not found" });

    res.json({ jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
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
        $sort: { _id: 1 },
      },
    ]);

    // Format data for the chart
    const chartData = {
      dates: jobOrdersData.map(
        (item) => `${item._id.year}-${item._id.month}-${item._id.day}`
      ),
      counts: jobOrdersData.map((item) => item.count),
    };

    res.json(chartData); // Return chart data
  } catch (error) {
    console.error("Error fetching user job orders:", error);
    res
      .status(500)
      .json({ message: "Error fetching job orders", error: error.message });
  }
};

const getUserJobOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester, start, end } = getSemesterDates(new Date());
    const jobOrderCount = await JobOrder.countDocuments({ userId, createdAt: { $gte: start, $lte: end } });

    res.json({ userId, semester, jobOrderCount });
  } catch (error) {
    console.error("Error fetching user job orders:", error);
    res.status(500).json({ message: "Error fetching job orders", error: error.message });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const jobOrderId = req.params.id;
    const { feedback } = req.body;
    if (!mongoose.Types.ObjectId.isValid(jobOrderId)) return res.status(400).json({ error: "Invalid Job ID" });

    const jobOrder = await JobOrder.findById(jobOrderId);
    if (!jobOrder) return res.status(404).json({ error: "Job order not found" });

    jobOrder.feedback = feedback;
    jobOrder.feedbackSubmitted = true;
    jobOrder.tracking.forEach(tracking => {
      const validStatuses = ["on-hold", "ongoing", "completed", "pending"];
      if (!validStatuses.includes(tracking.status)) tracking.status = "pending";
    });

    await jobOrder.save();
    res.json({ message: "Feedback submitted successfully", jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getFeedbacks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const perPage = parseInt(limit, 10);
    const skip = (page - 1) * perPage;

    const totalJobOrders = await JobOrder.countDocuments({ feedback: { $ne: "" } });
    const jobOrders = await JobOrder.find({ feedback: { $ne: "" } }).skip(skip).limit(perPage).lean().exec();
    const totalPages = Math.ceil(totalJobOrders / perPage);

    const feedbacks = jobOrders.map(order => ({
      _id: order._id.toString(),
      firstName: order.firstName,
      lastName: order.lastName,
      jobDesc: order.jobDesc,
      campus: order.campus,
      building: order.building,
      floor: order.floor,
      reqOffice: order.reqOffice,
      scenario: order.scenario,
      object: order.object,
      fileUrl: order.fileUrl,
      date: order.createdAt,
      feedback: order.feedback
    }));

    return res.json({ feedbacks, totalPages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

const getJobRequestsByDepartmentAndSemester = async (req, res) => {
  try {
    const now = new Date();
    const { semester, start, end } = getSemesterDates(now);

    const jobRequestsData = await JobOrder.aggregate([
      { $project: { semester: { $cond: [{ $and: [{ $gte: ["$createdAt", start] }, { $lte: ["$createdAt", end] }] }, semester, "Unknown"] }, department: "$reqOffice", status: "$status" } },
      { $group: { _id: { semester: "$semester", department: "$department" }, count: { $sum: 1 } } },
      { $sort: { "_id.semester": 1 } }
    ]);

    const chartData = [];
    const semesters = ["First Semester", "Second Semester", "Third Semester"];
    semesters.forEach(sem => {
      const semesterData = { semester: sem };
      jobRequestsData.forEach(entry => {
        if (entry._id.semester === sem) semesterData[entry._id.department] = entry.count;
        else if (!semesterData[entry._id.department]) semesterData[entry._id.department] = 0;
      });
      chartData.push(semesterData);
    });

    const departmentCounts = jobRequestsData.reduce((acc, curr) => {
      const department = curr._id.department;
      acc[department] = (acc[department] || 0) + curr.count;
      return acc;
    }, {});

    res.json({ semesters, chartData, departmentCounts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching job requests data", error });
  }
};

const getReports = async (req, res) => {
  try {
    const { specificJobOrder, status, dateRange, reqOffice, building, floor, campus } = req.query;
    const filter = {};

    if (specificJobOrder) filter._id = specificJobOrder;
    if (status) filter.status = status;
    if (campus) filter.campus = campus;
    if (building) filter.building = building;
    if (floor) filter.floor = floor;
    if (reqOffice) filter.reqOffice = reqOffice;
    if (dateRange) {
      const [start, end] = dateRange.split(":");
      filter.dateOfRequest = { $gte: new Date(start), $lte: new Date(end) };
    }

    const jobOrders = await JobOrder.find(filter);
    res.json({ requests: jobOrders });
  } catch (error) {
    console.error("Error fetching filtered reports:", error);
    res.status(500).json({ message: "Error fetching filtered reports." });
  }
};

const getStatusCounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await JobOrder.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusCounts = { pending: 0, ongoing: 0, completed: 0, rejected: 0 };
    result.forEach(({ _id, count }) => {
      if (statusCounts.hasOwnProperty(_id)) statusCounts[_id] = count;
    });

    res.json(statusCounts);
  } catch (error) {
    console.error("Error fetching job order status counts:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getJobOrdersCountByDepartment = async (req, res) => {
  try {
    const departmentCounts = await JobOrder.aggregate([
      { $group: { _id: "$reqOffice", count: { $sum: 1 } } },
      { $project: { department: "$_id", count: 1, _id: 0 } }
    ]);

    res.status(200).json(departmentCounts);
  } catch (error) {
    console.error("Error fetching department job order counts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllStatusCounts = async (req, res) => {
  try {
    const ongoingCount = await JobOrder.countDocuments({ status: "ongoing" });
    const rejectedCount = await JobOrder.countDocuments({ status: "rejected" });
    const completedCount = await JobOrder.countDocuments({ status: "completed" });
    const pending = await JobOrder.countDocuments({ status: "pending" });

    res.json({ ongoing: ongoingCount, rejected: rejectedCount, completed: completedCount, pending });
  } catch (error) {
    console.error("Error fetching job order status counts:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const StatusList = async (req, res) => {
  try {
    const { status } = req.query;
    const jobOrders = await JobOrder.find({ status });
    res.json(jobOrders);
  } catch (error) {
    console.error("Error fetching job orders:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getStatusUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const counts = await JobOrder.aggregate([
      { $match: { userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusCounts = {
      pending: counts.find(c => c._id === "pending")?.count || 0,
      ongoing: counts.find(c => c._id === "ongoing")?.count || 0,
      completed: counts.find(c => c._id === "completed")?.count || 0,
      rejected: counts.find(c => c._id === "rejected")?.count || 0
    };

    res.json(statusCounts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching status counts" });
  }
};

const getUsersJobOrders = async (req, res) => {
  const { status } = req.query;
  const userId = req.user._id;
  if (!status) return res.status(400).json({ message: "Status is required" });

  try {
    const jobOrders = await JobOrder.find({ userId, status });
    if (!jobOrders || jobOrders.length === 0) return res.status(404).json({ message: "No job orders found" });
    res.status(200).json(jobOrders);
  } catch (error) {
    console.error("Error fetching user job orders:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getUserStatusCounts = async (req, res) => {
  const { userId } = req.query;
  try {
    const statusCounts = await JobOrder.aggregate([
      { $match: { userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const counts = { pending: 0, ongoing: 0, completed: 0, rejected: 0 };
    statusCounts.forEach(({ _id, count }) => { counts[_id] = count; });
    res.status(200).json(counts);
  } catch (error) {
    console.error("Error fetching status counts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  AddJobOrder,
  getRequests,
  approveRequest,
  rejectRequest,
  followUpJobOrder,
  getJobOrders,
  getJobOrdersArchive,
  updateJobOrder,
  completeWithRemarks,
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
  getReports,
  getStatusCounts,
  getAllStatusCounts,
  getJobOrdersCountByDepartment,
  getStatusUsers,
  StatusList,
  getUsersJobOrders,
  getUserStatusCounts
};