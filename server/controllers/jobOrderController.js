const mongoose = require("mongoose");
const JobOrder = require("../models/jobOrder");
const Account = require("../models/Account");
const UserInfo = require("../models/UserInfo");
const { sendGeneralEmail } = require("../helpers/SendEmail"); // Import the general email function
const getSemesterDates = require("../helpers/getSemesterDates");

const AddJobOrder = async (req, res) => {
  try {
    const {
      jobType,
      firstName,
      lastName,
      reqOffice,
      position,
      jobDesc,
      scenario,
      object,
      dateOfRequest,
      dateFrom, // Add dateFrom
      dateTo, // Add dateTo
    } = req.body;

    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ error: "User ID is missing" });
    }

    if (
      !jobType ||
      !firstName ||
      !lastName ||
      !reqOffice ||
      !position ||
      !jobDesc ||
      !dateOfRequest ||
      !dateFrom || // Validate dateFrom
      !dateTo // Validate dateTo
    ) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    // File information is available in req.file
    const fileUrl = req.file ? req.file.path : null;

    // Get today's date and format it
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().slice(-2); // Last 2 digits of the year
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");

    // Count today's job orders
    const todayStart = new Date(currentDate.setHours(0, 0, 0, 0));
    const todayEnd = new Date(currentDate.setHours(23, 59, 59, 999));
    const jobOrderCount = await JobOrder.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Create the job order reference number
    const jobOrderNumber = `${year}-${month}${day}${String(
      jobOrderCount + 1
    ).padStart(2, "0")}`;

    // Create the new job order
    const jobOrderInfo = new JobOrder({
      userId,
      jobType,
      firstName,
      lastName,
      reqOffice,
      position,
      jobDesc,
      scenario,
      object,
      fileUrl,
      dateOfRequest,
      dateFrom, // Save dateFrom
      dateTo, // Save dateTo
      jobOrderNumber, // Store the reference code
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

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = {
      status: { $nin: ["ongoing", "rejected", "completed", "notCompleted"] },
    };

    // Apply filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.userId) query.userId = req.query.userId;
    if (req.query.dateRange) {
      const [startDate, endDate] = req.query.dateRange.split(":");
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const totalRequests = await JobOrder.countDocuments(query);
    const totalPages = Math.ceil(totalRequests / perPage);

    // Fetch requests and populate references
    const requests = await JobOrder.find(query)
      .populate("campus", "name") // Populating with only the name field
      .populate("building", "name") // Populating with only the name field
      .populate("floor", "number") // Populating with only the number field
      .populate("reqOffice", "name") // Populating with only the name field
      .skip(skip)
      .limit(perPage)
      .lean();

    return res.json({ requests, totalPages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

const approveRequest = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: "Invalid Job ID" });
    }

    const jobOrder = await JobOrder.findByIdAndUpdate(
      jobId,
      { status: "ongoing" },
      { new: true }
    );

    if (!jobOrder) {
      return res.status(404).json({ error: "Job Order not found" });
    }

    // Send response immediately without email to reduce duplicate notifications
    res.json({ message: "Job Order approved successfully", jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Controller for Updating Job Order with Email Notification
const updateJobOrder = async (req, res) => {
  try {
    const {
      urgency,
      assignedTo,
      status,
      dateAssigned,
    } = req.body;
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: "Invalid Job ID" });
    }

    const updateFields = {};
    if (urgency) updateFields.urgency = urgency;
    if (status) updateFields.status = status;

    // Get assigned user's name if assignedTo is provided
    if (assignedTo) {
      const user = await UserInfo.findOne({ email: assignedTo });
      if (user) {
        updateFields.assignedTo = `${user.firstName} ${user.lastName}`;
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    }

    // Update additional fields if provided
    if (dateAssigned) updateFields.dateAssigned = dateAssigned;

    const jobOrder = await JobOrder.findByIdAndUpdate(jobId, updateFields, {
      new: true,
    });

    if (!jobOrder) {
      return res.status(404).json({ error: "Job Order not found" });
    }

    // Get user information to send an email notification
    const user = await Account.findById(jobOrder.userId);
    if (user && user.email) {
      // Prepare email content with both user-submitted and updated job order information
      const subject = `Update on Your Job Order: ${jobOrder.jobOrderNumber}`;

      const message = `

Your job order with the reference number **${
        jobOrder.jobOrderNumber
      }** has been updated. Below is a summary of your request and the latest updates:

---

### Job Order Summary
- **Job Type**: ${jobOrder.jobType}
- **Campus**: ${jobOrder.campus}
- **Requesting Office**: ${jobOrder.reqOffice || "N/A"}
- **Position**: ${jobOrder.position}
- **Description**: ${jobOrder.jobDesc}

---

### Detailed Job Order Information

**Submitted Details:**
- **Building**: ${jobOrder.building || "N/A"}
- **Floor**: ${jobOrder.floor || "N/A"}
- **Scenario**: ${jobOrder.scenario || "N/A"}
- **Object**: ${jobOrder.object || "N/A"}

**Current Status**: ${jobOrder.status || "Pending"}

---

### Recent Updates
- **Assigned To**: ${jobOrder.assignedTo || "N/A"}
- **Urgency**: ${jobOrder.urgency || "N/A"}
- **Date Assigned**: ${
        jobOrder.dateAssigned
          ? jobOrder.dateAssigned.toLocaleDateString()
          : "N/A"
      }
- **Scheduled Work**: ${jobOrder.scheduleWork || "N/A"}
- **Work Period**: ${
        jobOrder.dateFrom ? jobOrder.dateFrom.toLocaleDateString() : "N/A"
      } - ${jobOrder.dateTo ? jobOrder.dateTo.toLocaleDateString() : "N/A"}
- **Estimated Cost**: ${
        jobOrder.costRequired ? `$${jobOrder.costRequired.toFixed(2)}` : "N/A"
      }
- **Charge To**: ${jobOrder.chargeTo || "N/A"}

---

Thank you for using our services. If you have any further questions, feel free to reach out.

Best regards,  
**Physical Facilities Management Office**
`;

      await sendGeneralEmail(user.email, subject, message);
    }

    res.json({
      message: "Job Order updated successfully with notification",
      jobOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: "Invalid Job ID" });
    }

    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const jobOrder = await JobOrder.findByIdAndUpdate(
      jobId,
      {
        status: "rejected",
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!jobOrder) {
      return res.status(404).json({ error: "Job Order not found" });
    }

    res.json({
      message: "Job Order rejected and archived successfully",
      jobOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getJobOrders = async (req, res) => {
  try {
    const { page = 1, status, lastName, dateRange, filterBy } = req.query;
    const perPage = 25;
    const skip = (page - 1) * perPage;

    // Build the query object based on the provided filters
    const query = {};

    if (status) {
      query.status = status;
    }

    if (lastName) {
      // Assuming lastName field in your schema is 'lastName'
      query.lastName = new RegExp(lastName, "i"); // Case-insensitive search
    }

    if (dateRange && filterBy) {
      const [startDate, endDate] = dateRange.split(":");

      if (filterBy === "day") {
        query.createdAt = {
          $gte: new Date(`${startDate}T00:00:00.000Z`),
          $lt: new Date(`${endDate}T23:59:59.999Z`),
        };
      } else if (filterBy === "month") {
        query.createdAt = {
          $gte: new Date(`${startDate}-01T00:00:00.000Z`),
          $lt: new Date(`${endDate}-31T23:59:59.999Z`),
        };
      } else if (filterBy === "year") {
        query.createdAt = {
          $gte: new Date(`${startDate}-01-01T00:00:00.000Z`),
          $lt: new Date(`${endDate}-12-31T23:59:59.999Z`),
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
    const jobOrdersWithTracking = requests.map((order) => ({
      ...order,
      tracking: order.tracking || [],
    }));

    return res.json({ requests: jobOrdersWithTracking, totalPages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

const getJobOrdersArchive = async (req, res) => {
  try {
    const { page = 1, status, lastName, dateRange, filterBy } = req.query;
    const perPage = 25;
    const skip = (page - 1) * perPage;

    // Build the query object based on the provided filters
    const query = { status: { $nin: ["ongoing", "pending"] } };

    if (status) {
      query.status = status;
    }

    if (lastName) {
      // Assuming lastName field in your schema is 'lastName'
      query.lastName = new RegExp(lastName, "i"); // Case-insensitive search
    }

    if (dateRange && filterBy) {
      const [startDate, endDate] = dateRange.split(":");

      if (filterBy === "day") {
        query.createdAt = {
          $gte: new Date(`${startDate}T00:00:00.000Z`),
          $lt: new Date(`${endDate}T23:59:59.999Z`),
        };
      } else if (filterBy === "month") {
        query.createdAt = {
          $gte: new Date(`${startDate}-01T00:00:00.000Z`),
          $lt: new Date(`${endDate}-31T23:59:59.999Z`),
        };
      } else if (filterBy === "year") {
        query.createdAt = {
          $gte: new Date(`${startDate}-01-01T00:00:00.000Z`),
          $lt: new Date(`${endDate}-12-31T23:59:59.999Z`),
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
    const jobOrdersWithTracking = requests.map((order) => ({
      ...order,
      tracking: order.tracking || [],
    }));

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

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: "Invalid Job ID" });
    }

    const jobOrder = await JobOrder.findByIdAndUpdate(
      jobId,
      {
        status: "completed",
        remarks: remarks,
      },
      { new: true }
    );
    if (!jobOrder) {
      return res.status(404).json({ error: "Job Order not found" });
    }

    res.json({ message: "Job Order completed successfully", jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const completeJobOrder = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: "Invalid Job ID" });
    }

    const jobOrder = await JobOrder.findByIdAndUpdate(
      jobId,
      { status: "completed" },
      { new: true }
    );

    if (!jobOrder) {
      return res.status(404).json({ error: "Job Order not found" });
    }

    res.json({
      message: "Job Order marked as completed successfully",
      jobOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// di nagagamit
const getAssignUsers = async (req, res) => {
  try {
    const { role, position } = req.query;
    const query = { role, position };
    const users = await Account.find(query).select("firstName lastName");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getApplicationCount = async (req, res) => {
  try {
    const query = { status: { $nin: ["ongoing", "rejected"] } };

    // Apply filters if needed
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
  const { tracking } = req.body; // Get the tracking array

  try {
    // Find the job order by ID
    const jobOrder = await JobOrder.findById(id);
    if (!jobOrder) {
      return res.status(404).json({ message: "Job order not found" });
    }

    // Ensure the tracking array has at least one entry to get status and note
    if (tracking && tracking.length > 0) {
      const { note } = tracking[tracking.length - 1]; // Get the latest entry

      // Update the tracking array
      jobOrder.tracking.push({ note });
      await jobOrder.save();

      // Find the user by userId to get their email
      const user = await Account.findById(jobOrder.userId);
      if (user && user.email) {
        // Prepare email details
        const subject = `Update on Your Job Order ${jobOrder._id}`;
        const message = `
          Dear User,

          We wanted to inform you that the status of your job order has been updated.

          **Note:** ${note}

          Thank you for your attention.

          Best regards,
          Physical Facilities Management Office
        `;

        // Send the email
        await sendGeneralEmail(user.email, subject, message);
      }
    } else {
      return res
        .status(400)
        .json({ message: "Tracking information is required" });
    }

    return res
      .status(200)
      .json({ message: "Job order updated and email sent" });
  } catch (error) {
    console.error("Error updating job order:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getJobOrderTracking = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: "Invalid Job ID" });
    }

    const jobOrder = await JobOrder.findById(jobId).select("tracking");

    if (!jobOrder) {
      return res.status(404).json({ error: "Job Order not found" });
    }

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
        $lte: end,
      },
    });

    // Send the count back in the response
    res.json({
      userId,
      semester,
      jobOrderCount,
    });
  } catch (error) {
    console.error("Error fetching user job orders:", error);
    res
      .status(500)
      .json({ message: "Error fetching job orders", error: error.message });
  }
};

// controllers/jobOrderController.js
const submitFeedback = async (req, res) => {
  try {
    const jobOrderId = req.params.id; // Ensure this matches your route
    const { feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobOrderId)) {
      return res.status(400).json({ error: "Invalid Job ID" });
    }

    const jobOrder = await JobOrder.findById(jobOrderId);

    if (!jobOrder) {
      return res.status(404).json({ error: "Job order not found" });
    }

    jobOrder.feedback = feedback;
    jobOrder.feedbackSubmitted = true;

    jobOrder.tracking.forEach((tracking) => {
      const validStatuses = ["on-hold", "ongoing", "completed", "pending"];
      if (!validStatuses.includes(tracking.status)) {
        tracking.status = "pending"; // Default or handle invalid status
      }
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

    // Count only job orders with feedback
    const totalJobOrders = await JobOrder.countDocuments({
      feedback: { $ne: "" },
    });

    const jobOrders = await JobOrder.find({ feedback: { $ne: "" } }) // Only fetch job orders with feedback
      .skip(skip)
      .limit(perPage)
      .lean()
      .exec();

    const totalPages = Math.ceil(totalJobOrders / perPage);

    // Map the job orders to include feedback details
    const feedbacks = jobOrders.map((order) => ({
      _id: order._id.toString(), // Ensure _id is a string
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
      date: order.createdAt, // Use createdAt or any other date field
      feedback: order.feedback,
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

    // Aggregate job orders by department and semester
    const jobRequestsData = await JobOrder.aggregate([
      {
        $project: {
          semester: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", start] },
                  { $lte: ["$createdAt", end] },
                ],
              },
              semester,
              "Unknown",
            ],
          },
          department: "$reqOffice",
          status: "$status",
        },
      },
      {
        $group: {
          _id: { semester: "$semester", department: "$department" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.semester": 1 },
      },
    ]);

    // Prepare a flattened data structure for the chart
    const chartData = [];
    const semesters = ["First Semester", "Second Semester", "Third Semester"];

    // Initialize chartData for each semester
    semesters.forEach((sem) => {
      const semesterData = { semester: sem }; // Start with the semester label
      jobRequestsData.forEach((entry) => {
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
      departmentCounts, // Include department job order counts
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching job requests data", error });
  }
};

// controllers/analyticsController.js
const analyzeJobOrders = async (req, res) => {
  try {
    const recommendations = await JobOrder.aggregate([
      {
        $match: {
          status: "approved",
          scenario: { $ne: "" }, // Exclude records without a scenario
          object: { $ne: "" }, // Exclude records without an object
        },
      },
      {
        $group: {
          _id: {
            reqOffice: "$reqOffice",
            building: "$building",
            floor: "$floor",
            scenario: "$scenario",
            object: "$object",
          },
          occurrences: { $sum: 1 },
          lastOccurrence: { $max: "$createdAt" },
        },
      },
      {
        $project: {
          reqOffice: "$_id.reqOffice",
          building: "$_id.building",
          floor: "$_id.floor",
          scenario: "$_id.scenario",
          object: "$_id.object",
          occurrences: 1,
          trend: {
            $cond: {
              if: { $gte: ["$occurrences", 5] },
              then: "Increasing",
              else: "Stable",
            },
          },
          urgency: {
            $cond: {
              if: { $gte: ["$occurrences", 10] },
              then: "High",
              else: {
                $cond: {
                  if: { $gte: ["$occurrences", 5] },
                  then: "Medium",
                  else: "Low",
                },
              },
            },
          },
          severity: {
            $switch: {
              branches: [
                {
                  case: {
                    $in: ["$scenario", ["Broken", "Leaking", "Not Working"]],
                  },
                  then: "Critical",
                },
                {
                  case: {
                    $in: [
                      "$scenario",
                      ["Busted", "Loose", "Cracked", "Burnt Out"],
                    ],
                  },
                  then: "Moderate",
                },
                {
                  case: {
                    $in: ["$scenario", ["Slippery", "Clogged", "Noisy"]],
                  },
                  then: "Minor",
                },
              ],
              default: "Unknown", // for any unexpected severity
            },
          },
        },
      },
      {
        $addFields: {
          severityRank: {
            $switch: {
              branches: [
                { case: { $eq: ["$severity", "Critical"] }, then: 3 },
                { case: { $eq: ["$severity", "Moderate"] }, then: 2 },
                { case: { $eq: ["$severity", "Minor"] }, then: 1 },
              ],
              default: 0, // for any unexpected severity
            },
          },
          recommendedAction: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$severity", "Critical"] },
                  then: "Immediate repair and inspection needed. Increase inspection frequency.",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$severity", "Moderate"] },
                      { $eq: ["$trend", "Increasing"] },
                    ],
                  },
                  then: "Schedule maintenance within a week and monitor closely.",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$severity", "Moderate"] },
                      { $eq: ["$trend", "Stable"] },
                    ],
                  },
                  then: "Plan for maintenance within the month.",
                },
                {
                  case: { $eq: ["$severity", "Minor"] },
                  then: "Add to regular maintenance schedule and monitor annually.",
                },
              ],
              default: "Evaluate and define appropriate action.",
            },
          },
        },
      },
      {
        $sort: { severityRank: -1 }, // Sort by severity rank descending
      },
      {
        $project: {
          severityRank: 0, // Exclude the severityRank from the final output
        },
      },
    ]);

    res.status(200).json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze job orders" });
  }
};

// Controller.js
const getReports = async (req, res) => {
  try {
    const {
      specificJobOrder,
      status,
      dateRange,
      reqOffice,
      building,
      floor,
      campus,
    } = req.query;

    // Initialize filter object
    const filter = {};

    // Add each parameter if it exists
    if (specificJobOrder) filter._id = specificJobOrder;
    if (status) filter.status = status;
    if (campus) filter.campus = campus;
    if (building) filter.building = building;
    if (floor) filter.floor = floor;
    if (reqOffice) filter.reqOffice = reqOffice;

    // Handle date range filtering if both dates are provided
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

// controllers/statusController.js
const getStatusCounts = async (req, res) => {
  try {
    const userId = req.user.id; // Extract userId from req.user, assuming JWT middleware populates req.user

    const result = await JobOrder.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Transform result into an object with statuses as keys and counts as values
    const statusCounts = {
      pending: 0,
      ongoing: 0,
      completed: 0,
      rejected: 0,
    };
    result.forEach(({ _id, count }) => {
      if (statusCounts.hasOwnProperty(_id)) {
        statusCounts[_id] = count;
      }
    });

    res.json(statusCounts);
  } catch (error) {
    console.error("Error fetching job order status counts:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Controller function to get job orders count by department
const getJobOrdersCountByDepartment = async (req, res) => {
  try {
    // Aggregate job orders by department
    const departmentCounts = await JobOrder.aggregate([
      {
        $group: {
          _id: "$reqOffice", // Assuming reqOffice is the field storing department names
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          department: "$_id",
          count: 1,
          _id: 0, // Exclude the _id field from the result
        },
      },
    ]);

    res.status(200).json(departmentCounts);
  } catch (error) {
    console.error("Error fetching department job order counts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllStatusCounts = async (req, res) => {
  try {
    // Fetch counts for each job order status (approved, rejected, completed, not completed) for all users
    const ongoingCount = await JobOrder.countDocuments({ status: "ongoing" });
    const rejectedCount = await JobOrder.countDocuments({ status: "rejected" });
    const completedCount = await JobOrder.countDocuments({
      status: "completed",
    });
    const pending = await JobOrder.countDocuments({ status: "pending" });

    // Send back the counts
    res.json({
      ongoing: ongoingCount,
      rejected: rejectedCount,
      completed: completedCount,
      pending: pending,
    });
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

// Endpoint to get status counts
const getStatusUsers = async (req, res) => {
  try {
    const userId = req.user._id; // Assume you have user ID from the request (e.g., via middleware)

    // Count documents by status for the user
    const counts = await JobOrder.aggregate([
      { $match: { userId } }, // Match the user's documents
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Transform the result into a structured object
    const statusCounts = {
      pending: counts.find((c) => c._id === "pending")?.count || 0,
      ongoing: counts.find((c) => c._id === "ongoing")?.count || 0,
      completed: counts.find((c) => c._id === "completed")?.count || 0,
      rejected: counts.find((c) => c._id === "rejected")?.count || 0,
    };

    res.json(statusCounts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching status counts" });
  }
};

// Fetch job orders for a specific user based on status
const getUsersJobOrders = async (req, res) => {
  const { status } = req.query; // Only retrieve status from query

  const userId = req.user._id; // Extract userId from the authenticated request

  // You can add similar checks for status
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const jobOrders = await JobOrder.find({ userId, status });

    if (!jobOrders || jobOrders.length === 0) {
      return res.status(404).json({ message: "No job orders found" });
    }

    res.status(200).json(jobOrders);
  } catch (error) {
    console.error("Error fetching user job orders:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get status counts for the user
const getUserStatusCounts = async (req, res) => {
  const { userId } = req.query;

  try {
    const statusCounts = await JobOrder.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {
      pending: 0,
      ongoing: 0,
      completed: 0,
      rejected: 0,
    };

    statusCounts.forEach(({ _id, count }) => {
      counts[_id] = count;
    });

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
  analyzeJobOrders,
  getReports,
  getStatusCounts,
  getAllStatusCounts,
  getJobOrdersCountByDepartment,
  getStatusUsers,
  StatusList,
  getUsersJobOrders,
  getUserStatusCounts,
};
