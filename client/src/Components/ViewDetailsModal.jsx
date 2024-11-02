import React from "react";
import {
  Box,
  Modal,
  Typography,
  Paper,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ViewDetailsModal = ({ open, onClose, request }) => {
  const exportToPDF = async () => {
    const doc = new jsPDF("portrait");
    const logo = await import("../assets/img/NU_shield.png");

    // Add logo at the top left corner
    doc.addImage(logo.default, "PNG", 10, 10, 30, 30);

    // Title
    doc.setFontSize(20);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor("#35408e");
    doc.text("National University Job Order Report", 50, 20);

    // Date Generated
    doc.setFontSize(12);
    doc.setTextColor("#333");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 50);

    // Separator line
    doc.setDrawColor(150);
    doc.line(10, 55, 200, 55);

    // Prepare the data for the details table
    const details = [
      { label: "Requestor", value: `${request.firstName} ${request.lastName}` },
      { label: "Scenario", value: request.scenario },
      { label: "Object", value: request.object },
      { label: "Building", value: request.building },
      { label: "Campus", value: request.campus },
      { label: "Floor", value: request.floor },
      { label: "Requesting Office", value: request.reqOffice },
      {
        label: "Date Requested",
        value: new Date(request.dateTo).toLocaleDateString(),
      },
      {
        label: "Date From",
        value: new Date(request.dateFrom).toLocaleDateString(),
      },
      {
        label: "Date To",
        value: new Date(request.createdAt).toLocaleDateString(),
      },
      { label: "Description", value: request.jobDesc },
    ];

    // Set position for the image
    const imgYPosition = 65;

    // Add submitted image if available and adjust size
    if (request?.fileUrl) {
      const img = await loadImage(request.fileUrl); // Load the image
      doc.addImage(img, "JPEG", 10, imgYPosition, 90, 90); // Add image
    }

    // Set position for the table below the image
    const startY = request?.fileUrl ? imgYPosition + 90 + 10 : imgYPosition; // Below the image

    // Create the table using autoTable
    doc.autoTable({
      startY: startY,
      head: [["Field", "Details"]], // Table header
      body: details.map((detail) => [detail.label, detail.value]), // Table body
      headStyles: { fillColor: "#35408e", textColor: "#fff", fontSize: 12 },
      bodyStyles: { textColor: "#333", fontSize: 10, overflow: "linebreak" },
      alternateRowStyles: { fillColor: "#f3f3f3" },
      styles: { cellWidth: "auto", minCellHeight: 10, halign: "left" }, // Set cell width to auto to allow wrapping
      columnStyles: { 1: { cellWidth: "auto" } }, // Allow the second column (Details) to auto size
      margin: { top: 10 }, // Adjusts margin from top
    });

    // Footer Section
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor("#888");
    doc.text(
      "This report is machine-generated for National University Manila.",
      10,
      pageHeight - 10
    );

    // Save the PDF
    doc.save("job_order_details.pdf");
  };

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img.src);
      img.onerror = (err) => reject(err);
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="request-details-modal-title"
      aria-describedby="request-details-modal-description"
      BackdropProps={{
        timeout: 0,
        sx: { backdropFilter: "blur(5px)" },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 900,
          p: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        {/* Close Button */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Image Section */}
        {request?.fileUrl && (
          <Paper
            elevation={3}
            sx={{
              flex: "1 1 40%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={request.fileUrl}
              alt="Submitted File"
              style={{
                maxWidth: "100%",
                borderRadius: 8,
                objectFit: "contain",
              }}
            />
          </Paper>
        )}

        {/* Details Section */}
        <Box
          sx={{
            flex: "1 1 60%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h5" component="h2">
            Application Details
          </Typography>
          {request && (
            <>
              <Typography>
                <strong>Requestor:</strong> {request.firstName}{" "}
                {request.lastName}
              </Typography>
              <Typography>
                <strong>Scenario:</strong> {request.scenario}
              </Typography>
              <Typography>
                <strong>Object:</strong> {request.object}
              </Typography>
              <Typography>
                <strong>Building:</strong> {request.building}
              </Typography>
              <Typography>
                <strong>Campus:</strong> {request.campus}
              </Typography>
              <Typography>
                <strong>Floor:</strong> {request.floor}
              </Typography>
              <Typography>
                <strong>Requesting Office:</strong> {request.reqOffice}
              </Typography>
              <Typography>
                <strong>Date Requested:</strong>{" "}
                {new Date(request.dateTo).toLocaleDateString()}
              </Typography>
              <Typography>
                <strong>Date From:</strong>{" "}
                {new Date(request.dateFrom).toLocaleDateString()}
              </Typography>
              <Typography>
                <strong>Date To:</strong>{" "}
                {new Date(request.createdAt).toLocaleDateString()}
              </Typography>
              <Typography sx={{ wordBreak: "break-word" }}>
                <strong>Description:</strong> {request.jobDesc}
              </Typography>
            </>
          )}
          {/* Button to Export to PDF */}
          <Button variant="contained" color="primary" onClick={exportToPDF}>
            Export to PDF
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewDetailsModal;
