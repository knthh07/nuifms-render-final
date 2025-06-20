const mongoose = require("mongoose");
const JobOrder = require("../models/jobOrder");
const Account = require("../models/Account");
const UserInfo = require("../models/UserInfo");
const { sendGeneralEmail } = require("../helpers/SendEmail");
const getSemesterDates = require("../helpers/getSemesterDates");
const getNextJobOrderNumber = require("../helpers/jobOrderNumber");

const AddJobOrder = async (req, res) => {
  try {
    const {
      jobType, firstName, lastName, reqOffice, position, jobDesc,
      scenario, object, dateOfRequest, dateFrom, dateTo
    } = req.body;

    const userId = req.user.id;
    if (!userId) return res.status(401).json({ error: "User ID is missing" });

    if (!jobType || !firstName || !lastName || !reqOffice || !position || !jobDesc || !dateOfRequest || !dateFrom || !dateTo) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    const fileUrl = req.file ? req.file.path : null;
    const jobOrderNumber = await getNextJobOrderNumber();
    const status = position === 'Facilities Employee' ? 'ongoing' : 'pending';

    const jobOrderInfo = new JobOrder({
      userId, jobType, firstName, lastName, reqOffice, position,
      jobDesc, scenario, object, fileUrl, dateOfRequest,
      dateFrom, dateTo, jobOrderNumber, status
    });

    await jobOrderInfo.save();
    return res.status(201).json(jobOrderInfo);
  } catch (error) {
    console.error("AddJobOrder error:", error);
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

    // Get user details
    const user = await Account.findById(jobOrder.userId);
    if (user?.email) {
      const subject = `Job Order Approved: ${jobOrder.jobOrderNumber}`;

      // Plain text version
      const textMessage = `
JOB ORDER APPROVAL NOTIFICATION

Dear ${jobOrder.firstName},

Your job request has been approved and is now in progress.

JOB ORDER DETAILS:
Request Number: ${jobOrder.jobOrderNumber}
Job Type: ${jobOrder.jobType}
Requesting Office: ${jobOrder.reqOffice}
Request Date: ${new Date(jobOrder.dateOfRequest).toLocaleDateString()}
Status: Ongoing

DESCRIPTION:
${jobOrder.jobDesc}

${jobOrder.scenario ? `SCENARIO: ${jobOrder.scenario}` : ''}
${jobOrder.object ? `OBJECT: ${jobOrder.object}` : ''}

TIMEFRAME:
From: ${new Date(jobOrder.dateFrom).toLocaleDateString()}
To: ${new Date(jobOrder.dateTo).toLocaleDateString()}

Please keep this notification for your records. You may present this job order number when inquiring about your request.

Best regards,
Physical Facilities Management Office
      `;

      // HTML version (consistent with your updateJobOrder style)
      const htmlMessage = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <h2 style="color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 10px; margin-bottom: 20px;">
    Job Order Approved: #${jobOrder.jobOrderNumber}
  </h2>
  
  <p>Dear ${jobOrder.firstName || 'Customer'},</p>
  <p>Your job request has been <strong style="color: #27ae60;">approved</strong> and is now in progress.</p>
  
  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
    <h3 style="margin-top: 0; color: #2c3e50;">Job Details:</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; width: 150px; font-weight: bold; vertical-align: top;">Status:</td>
        <td style="padding: 8px 0;"><span style="background-color: #3498db; color: white; padding: 3px 8px; border-radius: 3px;">ONGOING</span></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Job Type:</td>
        <td style="padding: 8px 0;">${jobOrder.jobType}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Requesting Office:</td>
        <td style="padding: 8px 0;">${jobOrder.reqOffice}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Request Date:</td>
        <td style="padding: 8px 0;">${new Date(jobOrder.dateOfRequest).toLocaleDateString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Timeframe:</td>
        <td style="padding: 8px 0;">
          From: ${new Date(jobOrder.dateFrom).toLocaleDateString()}<br>
          To: ${new Date(jobOrder.dateTo).toLocaleDateString()}
        </td>
      </tr>
      ${jobOrder.scenario ? `
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Scenario:</td>
        <td style="padding: 8px 0;">${jobOrder.scenario}</td>
      </tr>
      ` : ''}
      ${jobOrder.object ? `
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Object:</td>
        <td style="padding: 8px 0;">${jobOrder.object}</td>
      </tr>
      ` : ''}
      ${jobOrder.fileUrl ? `
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Attachment:</td>
        <td style="padding: 8px 0;">
          <a href="${jobOrder.fileUrl}" style="color: #2980b9; text-decoration: none;">Download File</a>
        </td>
      </tr>
      ` : ''}
    </table>
  </div>
  
  <div style="margin: 20px 0; padding: 15px; background-color: #f0f4f8; border-radius: 5px;">
    <h4 style="margin-top: 0; color: #2c3e50;">Job Description:</h4>
    <p style="white-space: pre-line; margin-bottom: 0;">${jobOrder.jobDesc}</p>
  </div>
  
  <p>Please keep this notification for your records. You may present this job order number when inquiring about your request.</p>
  
  <p style="margin-top: 30px;">Best regards,<br>Physical Facilities Management Office</p>
  
  <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #7f8c8d;">
    <p>This is an automated message. Please do not reply directly to this email.</p>
  </div>
</div>
      `;

      // Send approval email using sendGeneralEmail
      await sendGeneralEmail(user.email, subject, textMessage, htmlMessage);
    }

    res.json({ message: "Job Order approved successfully", jobOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateJobOrder = async (req, res) => {
  try {
    const { urgency, assignedTo, status, dateAssigned, costRequired, chargeTo } = req.body;
    const jobId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(jobId)) return res.status(400).json({ error: "Invalid Job ID" });

    const updateFields = {};
    if (urgency) updateFields.urgency = urgency;
    if (status) updateFields.status = status;
    if (costRequired) updateFields.costRequired = costRequired;
    if (chargeTo) updateFields.chargeTo = chargeTo;

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

      // HTML email content
      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2c3e50;">Job Order Update</h2>
          <p>Dear ${jobOrder.firstName || 'Customer'},</p>
          <p>Your job order with the reference number <strong>${jobOrder.jobOrderNumber}</strong> has been updated.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">Update Details:</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 5px 0; width: 120px; font-weight: bold;">Status:</td>
                <td style="padding: 5px 0;">${status || jobOrder.status}</td>
              </tr>
              ${urgency ? `
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Urgency:</td>
                <td style="padding: 5px 0;">${urgency}</td>
              </tr>
              ` : ''}
              ${assignedTo ? `
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Assigned To:</td>
                <td style="padding: 5px 0;">${updateFields.assignedTo}</td>
              </tr>
              ` : ''}
              ${dateAssigned ? `
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Date Assigned:</td>
                <td style="padding: 5px 0;">${new Date(dateAssigned).toLocaleDateString()}</td>
              </tr>
              ` : ''}
              ${costRequired ? `
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Cost Required:</td>
                <td style="padding: 5px 0;">${costRequired}</td>
              </tr>
              ` : ''}
              ${chargeTo ? `
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Charge To:</td>
                <td style="padding: 5px 0;">${chargeTo}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>Physical Facilities Management Office</p>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #7f8c8d;">
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      `;

      // Plain text fallback
      const textMessage = `Your job order with the reference number ${jobOrder.jobOrderNumber} has been updated.\n\n` +
        `Status: ${status || jobOrder.status}\n` +
        (urgency ? `Urgency: ${urgency}\n` : '') +
        (assignedTo ? `Assigned To: ${updateFields.assignedTo}\n` : '') +
        (dateAssigned ? `Date Assigned: ${new Date(dateAssigned).toLocaleDateString()}\n` : '') +
        `\nIf you have any questions, please contact us.\n\nBest regards,\nYPhysical Facilities Management Office`;

      await sendGeneralEmail(user.email, subject, textMessage, htmlMessage);
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

    // Get user details
    const user = await Account.findById(jobOrder.userId);
    if (user?.email) {
      const subject = `❌ Job Order Rejected: ${jobOrder.jobOrderNumber}`;

      // Plain text version
      const textMessage = `
JOB ORDER REJECTION NOTIFICATION

Dear ${jobOrder.firstName},

We regret to inform you that your job request has been rejected.

JOB ORDER DETAILS:
Request Number: ${jobOrder.jobOrderNumber}
Job Type: ${jobOrder.jobType}
Requesting Office: ${jobOrder.reqOffice}
Request Date: ${new Date(jobOrder.dateOfRequest).toLocaleDateString()}
Status: Rejected

REJECTION REASON:
${reason}

JOB DESCRIPTION:
${jobOrder.jobDesc}

If you believe this was done in error or would like clarification, please contact our office.

Best regards,
Physical Facilities Management Office
      `;

      // HTML version
      const htmlMessage = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
    <h2 style="color: #721c24; margin-top: 0;">
      ❌ Job Order Rejected: #${jobOrder.jobOrderNumber}
    </h2>
    <p style="color: #721c24; margin-bottom: 0;">
      Your request cannot be processed at this time
    </p>
  </div>

  <p>Dear ${jobOrder.firstName || 'Customer'},</p>
  <p>We regret to inform you that your job request has been <strong>rejected</strong>. Below are the details:</p>

  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
    <h3 style="margin-top: 0; color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
      Job Order Summary
    </h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; width: 150px; font-weight: bold; vertical-align: top;">Request Number:</td>
        <td style="padding: 8px 0;">${jobOrder.jobOrderNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Job Type:</td>
        <td style="padding: 8px 0;">${jobOrder.jobType}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Requesting Office:</td>
        <td style="padding: 8px 0;">${jobOrder.reqOffice}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Status:</td>
        <td style="padding: 8px 0;">
          <span style="background-color: #f8d7da; color: #721c24; padding: 3px 8px; border-radius: 3px; display: inline-block;">
            REJECTED
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Request Date:</td>
        <td style="padding: 8px 0;">${new Date(jobOrder.dateOfRequest).toLocaleDateString()}</td>
      </tr>
    </table>
  </div>

  <div style="margin: 20px 0; padding: 15px; background-color: #f0f4f8; border-radius: 5px;">
    <h4 style="margin-top: 0; color: #2c3e50;">Job Description:</h4>
    <p style="white-space: pre-line; margin-bottom: 0;">${jobOrder.jobDesc}</p>
  </div>

  <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h4 style="margin-top: 0; color: #856404;">Rejection Reason</h4>
    <p style="white-space: pre-line; margin-bottom: 0;">${reason}</p>
  </div>

  <p>If you believe this was done in error or would like clarification, please contact our office.</p>

  <p style="margin-top: 30px;">Best regards,<br>Physical Facilities Management Office</p>

  <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #7f8c8d;">
    <p>This is an automated message. Please do not reply directly to this email.</p>
  </div>
</div>
      `;

      // Send rejection email
      await sendGeneralEmail(user.email, subject, textMessage, htmlMessage);
    }

    res.json({
      message: "Job Order rejected and notification sent successfully",
      jobOrder: {
        jobOrderNumber: jobOrder.jobOrderNumber,
        status: jobOrder.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
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
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: "Invalid Job ID" });
    }

    const jobOrder = await JobOrder.findById(jobId);
    if (!jobOrder) {
      return res.status(404).json({ error: "Job Order not found" });
    }

    // Get ALL admins and superadmins
    const [admins, superAdmins] = await Promise.all([
      Account.find({ role: "admin" }).select('email firstName lastName'),
      Account.find({ role: "superadmin" }).select('email firstName lastName')
    ]);

    const subject = `🔔 Follow-Up Request: Job Order #${jobOrder.jobOrderNumber}`;

    // Plain text version
    const textMessage = `
FOLLOW-UP REQUEST NOTIFICATION

A follow-up has been requested for the following job order:

JOB ORDER DETAILS:
Request Number: ${jobOrder.jobOrderNumber}
Requesting Office: ${jobOrder.reqOffice}
Current Status: ${jobOrder.status}
Date Requested: ${new Date(jobOrder.dateOfRequest).toLocaleDateString()}

JOB DESCRIPTION:
${jobOrder.jobDesc}

Please address this follow-up request at your earliest convenience.

View full details in the job order system or contact the requester if needed.

Best regards,
Physical Facilities Management Office
    `;

    // HTML version
    const htmlMessage = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
    <h2 style="color: #721c24; margin-top: 0;">
      🔔 Follow-Up Request
    </h2>
    <p style="color: #721c24; margin-bottom: 0;">
      Attention needed for Job Order #${jobOrder.jobOrderNumber}
    </p>
  </div>

  <p>Dear Team,</p>
  <p>A follow-up has been requested for the following job order:</p>

  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
    <h3 style="margin-top: 0; color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
      Job Order Summary
    </h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; width: 150px; font-weight: bold; vertical-align: top;">Request Number:</td>
        <td style="padding: 8px 0;">${jobOrder.jobOrderNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Requesting Office:</td>
        <td style="padding: 8px 0;">${jobOrder.reqOffice}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Current Status:</td>
        <td style="padding: 8px 0;">
          <span style="background-color: ${jobOrder.status === 'completed' ? '#d4edda' : '#fff3cd'}; 
                      color: ${jobOrder.status === 'completed' ? '#155724' : '#856404'}; 
                      padding: 3px 8px; 
                      border-radius: 3px;
                      display: inline-block;">
            ${jobOrder.status.toUpperCase()}
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Date Requested:</td>
        <td style="padding: 8px 0;">${new Date(jobOrder.dateOfRequest).toLocaleDateString()}</td>
      </tr>
      ${jobOrder.assignedTo ? `
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Assigned To:</td>
        <td style="padding: 8px 0;">${jobOrder.assignedTo}</td>
      </tr>
      ` : ''}
    </table>
  </div>

  <div style="margin: 20px 0; padding: 15px; background-color: #f0f4f8; border-radius: 5px;">
    <h4 style="margin-top: 0; color: #2c3e50;">Job Description:</h4>
    <p style="white-space: pre-line; margin-bottom: 0;">${jobOrder.jobDesc}</p>
  </div>

  <div style="background-color: #e2f0fd; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
    <p style="margin: 0; font-weight: bold;">Please address this follow-up request at your earliest convenience.</p>
  </div>

  <p style="margin-top: 30px;">Best regards,<br>Physical Facilities Management Office</p>

  <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #7f8c8d;">
    <p>This is an automated notification. Please do not reply directly to this email.</p>
  </div>
</div>
    `;

    // Collect all recipient emails
    const recipients = [
      ...admins.map(a => a.email),
      ...superAdmins.map(sa => sa.email)
    ].filter(Boolean); // Remove any undefined/null emails

    if (recipients.length > 0) {
      await sendGeneralEmail(recipients, subject, textMessage, htmlMessage);
    } else {
      console.warn('No valid recipients found');
    }

    res.json({
      message: "Follow-up request processed successfully",
      recipientsCount: recipients.length,
      jobOrderNumber: jobOrder.jobOrderNumber
    });
  } catch (error) {
    console.error("Error in followUpJobOrder:", error);
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
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

  // Match these with your JobOrder schema's enum values
  const validStatuses = ['pending', 'ongoing', 'completed']; // adjust as needed

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid job order ID' });
    }

    const jobOrder = await JobOrder.findById(id);
    if (!jobOrder) {
      return res.status(404).json({ message: 'Job order not found' });
    }

    // Validate and normalize status
    const newStatus = status && validStatuses.includes(status.toLowerCase())
      ? status.toLowerCase()
      : 'pending';

    // Create tracking update
    const trackingUpdate = {
      date: new Date(),
      status: newStatus,
      note: note || 'No note provided',
      adminName
    };

    // Update both tracking and main status
    jobOrder.tracking.push(trackingUpdate);
    jobOrder.status = newStatus; // Keep main status in sync

    await jobOrder.save();

    return res.status(200).json({
      message: 'Job order tracking updated successfully',
      jobOrder
    });
  } catch (error) {
    console.error('Error updating job order tracking:', error);
    return res.status(500).json({
      message: 'Server error while updating tracking',
      error: error.message
    });
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

    console.log('Received feedback submission:', { jobOrderId, feedback });

    if (!mongoose.Types.ObjectId.isValid(jobOrderId))
      return res.status(400).json({ error: "Invalid Job ID" });

    if (!feedback || feedback.trim() === "") {
      return res.status(400).json({ error: "Feedback cannot be empty" });
    }

    const jobOrder = await JobOrder.findById(jobOrderId);
    if (!jobOrder) return res.status(404).json({ error: "Job order not found" });

    jobOrder.feedback = feedback;
    jobOrder.feedbackSubmitted = true;

    jobOrder.tracking.forEach(tracking => {
      const validStatuses = ["ongoing", "completed", "pending"];
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
    const {
      specificJobOrder,
      status,
      startDate,
      endDate,
      reqOffice,
      building,
      floor,
      campus,
    } = req.query;

    const filter = {};

    // Use $and only if necessary
    const andConditions = [];

    if (specificJobOrder) {
      andConditions.push({ _id: specificJobOrder });
    }

    if (status) {
      andConditions.push({ status });
    }

    if (campus) andConditions.push({ campus });
    if (building) andConditions.push({ building });
    if (floor) andConditions.push({ floor });
    if (reqOffice) andConditions.push({ reqOffice });

    if (startDate && endDate) {
      andConditions.push({
        dateOfRequest: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    console.log("Final MongoDB filter:", JSON.stringify(filter, null, 2));

    const jobOrders = await JobOrder.find(filter)
      .sort({ dateOfRequest: -1 })
      .lean();

    console.log(`Found ${jobOrders.length} matching records`);
    res.json({ requests: jobOrders });
  } catch (error) {
    console.error("Error fetching reports:", {
      error: error.message,
      receivedQuery: req.query,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Error fetching reports",
      error: error.message,
      receivedFilters: req.query,
    });
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