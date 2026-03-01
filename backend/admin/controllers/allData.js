const ExcelJS = require('exceljs');
const allDataCont = require('../model/allData');

const downloadApplicationStatus = async (req, res) => {
  try {
    const rows = await allDataCont.getAllApplicationStatus();
    if(rows.length === 0){
      return res.status(404).json({ message: "No application status found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Application Status");

    worksheet.columns = [
      { header: "OPH_ID", key: "OPH_ID", width: 20 },
      { header: "User Status", key: "user_status", width: 20 },
      { header: "Professional Status", key: "professional_status", width: 20 },
      { header: "Documentation Status", key: "documentation_status", width: 20 },
      { header: "Payment Status", key: "payment_status", width: 20 },
      { header: "Overall Status", key: "overall_status", width: 20 },
      { header: "Admin Status", key: "admin_status", width: 20 },
      { header: "Created At", key: "createdAt", width: 25 },
      { header: "Updated At", key: "updatedAt", width: 25 },
    ];

    // Date formatter
    const formatDate = (date) => {
      if (!date) return "";
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }).format(new Date(date));
    };

    rows.forEach((row) => {
      const newRow = worksheet.addRow({
        ...row,
        createdAt: formatDate(row.createdAt),
        updatedAt: formatDate(row.updatedAt),
      });

      // Function to style cells by status
      const applyStyle = (cell, value) => {
        if (!value) return;
        if (value === "rejected") {
          cell.font = { color: { argb: "FF0000" }, bold: true }; // red
        } else if (value === "completed" || value === "approved") {
          cell.font = { color: { argb: "228B22" }, bold: true }; // green
        } else if (value === "under review") {
          cell.font = { color: { argb: "FF8C00" }, bold: true }; // orange
        }
      };

      applyStyle(newRow.getCell("user_status"), row.user_status);
      applyStyle(newRow.getCell("professional_status"), row.professional_status);
      applyStyle(newRow.getCell("documentation_status"), row.documentation_status);
      applyStyle(newRow.getCell("payment_status"), row.payment_status);
      applyStyle(newRow.getCell("overall_status"), row.overall_status);
    });

    // Response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=application_status.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error downloading Excel:", error);
    res.status(500).json({ error: "Failed to download Excel file" });
  }
};

const downloadEventParticipants = async (req, res) => {
  try {
    const rows = await allDataCont.eventParticipantsDetails(); // your DB fetch function

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No event participants found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Event Participants");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "OPH_ID", key: "OPH_ID", width: 20 },
      { header: "Event ID", key: "event_id", width: 15 },
      { header: "Status", key: "status", width: 20 },
      { header: "Created At", key: "createdAt", width: 25 },
      { header: "Updated At", key: "updatedAt", width: 25 },
    ];

    // Format date in a readable way
    const formatDate = (date) => {
      if (!date) return "";
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }).format(new Date(date));
    };

    // Add data rows and apply conditional styling
    rows.forEach((row) => {
      const newRow = worksheet.addRow({
        ...row,
        createdAt: formatDate(row.createdAt),
        updatedAt: formatDate(row.updatedAt),
      });

      const statusCell = newRow.getCell("status");
      if (row.status === "rejected") {
        statusCell.font = { color: { argb: "FF0000" }, bold: true }; // red
      } else if (row.status === "accepted") {
        statusCell.font = { color: { argb: "228B22" }, bold: true }; // green
      } else if (row.status === "under review") {
        statusCell.font = { color: { argb: "FF8C00" }, bold: true }; // orange
      }
    });

    // Set headers for download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=event_participants.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error downloading Event Participants Excel:", error);
    res.status(500).json({ error: "Failed to download Excel file" });
  }
};

const downloadContactUs = async (req, res) => {
  try {
    const rows = await allDataCont.contactDetails(); // your DB fetch function

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No contact entries found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Contact Us");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Instagram Handle", key: "instagram_handle", width: 35 },
      { header: "Description", key: "description", width: 50 },
      { header: "Created At", key: "created_at", width: 25 },
    ];

    // Date formatter for created_at
    const formatDate = (date) => {
      if (!date) return "";
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }).format(new Date(date));
    };

    // Add rows
    rows.forEach((row) => {
      worksheet.addRow({
        ...row,
        created_at: formatDate(row.created_at),
      });
    });

    // Optional styling for headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    // Response headers for Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=contact_us.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error downloading Contact Us Excel:", error);
    res.status(500).json({ error: "Failed to download Excel file" });
  }
};

const downloadSpecialArtistDetails = async (req, res) => {
  try {
    const rows = await allDataCont.epkDetails(); // your DB fetch function

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No special artist details found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Special Artist Details");

    worksheet.columns = [
      { header: "OPH_ID", key: "ophid", width: 20 },
      { header: "Field", key: "field", width: 40 },
      { header: "Status", key: "status", width: 20 },
      { header: "Reason", key: "reason", width: 40 },
      { header: "Content", key: "content", width: 50 },
      { header: "Date", key: "date", width: 20 },
    ];

    // Date formatter
    const formatDate = (date) => {
      if (!date) return "";
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(date));
    };

    // Add rows and apply conditional styling
    rows.forEach((row) => {
      const newRow = worksheet.addRow({
        ...row,
        date: formatDate(row.date),
      });

      const statusCell = newRow.getCell("status");

      // Apply color-coded styles for status
      if (row.status === "rejected") {
        statusCell.font = { color: { argb: "FF0000" }, bold: true }; // Red
      } else if (row.status === "approved") {
        statusCell.font = { color: { argb: "228B22" }, bold: true }; // Green
      } else if (row.status === "under review") {
        statusCell.font = { color: { argb: "FF8C00" }, bold: true }; // Orange
      }
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    // Response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=special_artist_details.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error downloading Special Artist Details Excel:", error);
    res.status(500).json({ error: "Failed to download Excel file" });
  }
};

const downloadSongsRegister = async (req, res) => {
  try {
    const rows = await allDataCont.SongRegistrationDetails(); // your DB fetch function

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No songs found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Songs Register");

    worksheet.columns = [
      { header: "Song ID", key: "song_id", width: 10 },
      { header: "OPH_ID", key: "OPH_ID", width: 20 },
      { header: "Project Type", key: "project_type", width: 25 },
      { header: "Song Name", key: "Song_name", width: 40 },
      { header: "Release Date", key: "release_date", width: 20 },
      { header: "Lyrics Services", key: "Lyrics_services", width: 20 },
      { header: "Available on Music Platform", key: "availability_on_music_platform", width: 25 },
      { header: "Status", key: "status", width: 20 },
    ];

    // Date formatter
    const formatDate = (date) => {
      if (!date) return "";
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(date));
    };

    // Add rows and apply conditional formatting
    rows.forEach((row) => {
      const newRow = worksheet.addRow({
        song_id: row.song_id,
        OPH_ID: row.OPH_ID,
        project_type: row.project_type,
        Song_name: row.Song_name,
        release_date: formatDate(row.release_date),
        Lyrics_services: row.Lyrics_services ? "Yes" : "No",
        availability_on_music_platform: row.availability_on_music_platform ? "Yes" : "No",
        status: row.status,
      });

      // Apply color coding based on status
      const statusCell = newRow.getCell("status");
      switch (row.status) {
        case "Approved":
          statusCell.font = { color: { argb: "228B22" }, bold: true }; // green
          break;
        case "Rejected":
          statusCell.font = { color: { argb: "FF0000" }, bold: true }; // red
          break;
        case "Pending":
          statusCell.font = { color: { argb: "FF8C00" }, bold: true }; // orange
          break;
        case "Draft":
          statusCell.font = { color: { argb: "808080" }, italic: true }; // gray
          break;
      }
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=songs_register.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error downloading Songs Register Excel:", error);
    res.status(500).json({ error: "Failed to download Excel file" });
  }
};


const downloadUserDetails = async (req, res) => {
  try {
    const rows = await allDataCont.getAllUserDetails();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Details");

    worksheet.columns = [
      { header: "OPH_ID", key: "ophid", width: 20 },
      { header: "Full Name", key: "full_name", width: 25 },
      { header: "Stage Name", key: "stage_name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Contact Number", key: "contact_num", width: 15 }, 
      { header: "Artist Type", key: "artist_type", width: 20 },
      { header: "Personal Photo", key: "personal_photo", width: 30 },
      { header: "Location", key: "location", width: 20 },
      { header: "Created At", key: "createdAt", width: 25 },
      { header: "Updated At", key: "updatedAt", width: 25 },
    ];

    // Date formatter
    const formatDate = (date) => {
      if (!date) return "";
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }).format(new Date(date));
    };

    rows.forEach((row) => {
      const newRow = worksheet.addRow({
        ...row,
        createdAt: formatDate(row.createdAt),
        updatedAt: formatDate(row.updatedAt),
      });

    
      
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=user_details.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error downloading Excel:", error);
    res.status(500).json({ error: "Failed to download Excel file" });
  }
};



const downloadProfessionalDetails = async (req, res) => {
    try {
      const rows = await allDataCont.getAllProfessionalDetails();
  
      // Create workbook & worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Professional Details");
  
      worksheet.columns = [
        { header: "OPH_ID", key: "OPH_ID", width: 20 },
        { header: "Profession", key: "Profession", width: 20 },
        { header: "Bio", key: "Bio", width: 30 },
        { header: "Spotify Link", key: "SpotifyLink", width: 25 },
        { header: "Instagram Link", key: "InstagramLink", width: 25 },
        { header: "Facebook Link", key: "FacebookLink", width: 25 },
        { header: "Apple Music Link", key: "AppleMusicLink", width: 25 },
        { header: "Experience (Years)", key: "ExperienceYears", width: 20 },
        { header: "Experience (Months)", key: "ExperienceMonths", width: 20 },
        { header: "Songs Planning Count", key: "SongsPlanningCount", width: 20 },
        { header: "Songs Planning Type", key: "SongsPlanningType", width: 20 },
        { header: "Created At", key: "CreatedAt", width: 20 },
      ];
  
      rows.forEach((row) => {
        // ✅ Correctly calculate years & months
        const years = Math.floor(row.ExperienceMonthly / 12);
        const months = row.ExperienceMonthly % 12;
  
        worksheet.addRow({
          OPH_ID: row.OPH_ID,
          Profession: row.Profession,
          Bio: row.Bio,
          SpotifyLink: row.SpotifyLink,
          InstagramLink: row.InstagramLink,
          FacebookLink: row.FacebookLink,
          AppleMusicLink: row.AppleMusicLink,
          ExperienceYears: years,
          ExperienceMonths: months,
          SongsPlanningCount: row.SongsPlanningCount,
          SongsPlanningType: row.SongsPlanningType,
          CreatedAt: row.CreatedAt
            ? new Date(row.CreatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
            : "",
        });
      });
  
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=professional_details.xlsx"
      );
  
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error downloading Professional Details Excel:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };



const getDocumentationDetails = async (req, res) => {
  try {
    const rows = await allDataCont.getDocumentationDetails();

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Documentation Details");

    // Define columns
    worksheet.columns = [
      { header: "OPH ID", key: "OPH_ID", width: 20 },
      { header: "Bank Name", key: "BankName", width: 20 },
      { header: "Account Holder Name", key: "AccountHolderName", width: 25 },
      { header: "Account Number", key: "AccountNumber", width: 20 },
      { header: "IFSC Code", key: "IFSCCode", width: 15 },
      { header: "Agreement Accepted", key: "AgreementAccepted", width: 20 },
      { header: "Created At", key: "CreatedAt", width: 25 },
    ];

    // Add rows
    rows.forEach((row) => {
      worksheet.addRow({
        OPH_ID: row.OPH_ID,
        BankName: row.BankName,
        AccountHolderName: row.AccountHolderName,
        AccountNumber: row.AccountNumber,
        IFSCCode: row.IFSCCode,
        AgreementAccepted: row.AgreementAccepted === "1" ? "true" : "false",
        CreatedAt: new Date(row.CreatedAt).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Kolkata",
        }),
      });
    });

    // Set headers so browser downloads file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=documentation_details.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).send("Internal Server Error");
  }
};


const getSignUpPayments = async (req, res) => {
  try {
    const rows = await allDataCont.paymentDetails();

    // Ensure rows is an array
    if (!Array.isArray(rows)) {
      console.error("Payment details query returned non-array result:", rows);
      return res.status(500).json({ error: "Failed to fetch payment details" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sign Up Payments");

    // Define columns (excluding CreatedAt + reject_reason)
    worksheet.columns = [
      { header: "OPH ID", key: "OPH_ID", width: 15 },
      { header: "Transaction ID", key: "Transaction_ID", width: 20 },
      { header: "Review", key: "Review", width: 10 },
      { header: "Status", key: "Status", width: 20 },
      { header: "From", key: "From", width: 25 },
      { header: "Song ID", key: "song_id", width: 10 },
      { header: "Event ID", key: "event_id", width: 10 },
      { header: "Reject For", key: "reject_for", width: 20 },
      { header: "Release Date", key: "release_date", width: 20 },
    ];

    // Add data
    rows.forEach((row) => {
      worksheet.addRow({
        OPH_ID: row.OPH_ID,
        Transaction_ID: row.Transaction_ID,
        Review: row.Review === 1 ? "true" : "false",
        Status: row.Status,
        From: row.From,
        song_id: row.song_id,
        event_id: row.event_id,
        reject_for: row.reject_for,
        release_date: row.release_date
          ? new Date(row.release_date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              timeZone: "Asia/Kolkata",
            })
          : null,
      });
    });

    // Set download headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sign_up_payment.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).send("Internal Server Error");
  }
};


const getbookingsDetails = async (req, res) => {
  try {
    const rows = await allDataCont.bookingsDetails();
    

    console.log(rows);
    

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Calendar");

    // Define columns
    worksheet.columns = [
      { header: "OPH ID", key: "oph_id", width: 20 },
      { header: "Current Booking Date", key: "current_booking_date", width: 25 },
      { header: "Previous Booking Date", key: "previous_booking_date", width: 25 },
      { header: "Original Booking Date", key: "original_booking_date", width: 25 },
      { header: "Song Name", key: "song_name", width: 20 },
      { header: "Project Type", key: "project_type", width: 20 },
    ];

    console.log(rows);
    
    // Add rows
    rows.forEach((row) => {
      const formatDate = (dateString) => {
        if (!dateString) return null;
        
        // Handle Date objects and ISO strings
        let date;
        if (dateString instanceof Date) {
          date = dateString;
        } else if (typeof dateString === 'string') {
          // Handle simple date format like "2025-12-06"
          if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-');
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
          // Handle ISO format like "2026-01-28T18:30:00.000Z"
          else if (dateString.includes('T') && dateString.includes('Z')) {
            date = new Date(dateString);
          }
          // Handle format like "1/28/26" and convert to "28 Jan 2026"
          else if (dateString.includes('/')) {
            const parts = dateString.split('/');
            console.log(parts + " parts");
            
            if (parts?.length === 3) {
              const [month, day, year] = parts;
              // Convert 2-digit year to 4-digit year
              const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
              date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
            }
          }
        }
        
        // Format the date as "28 Jan 2026" in IST to avoid off-by-one due to UTC
        if (date && !isNaN(date.getTime())) {
          const dayStr = new Intl.DateTimeFormat('en-GB', { day: '2-digit', timeZone: 'Asia/Kolkata' }).format(date);
          const monthStr = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'Asia/Kolkata' }).format(date);
          const yearStr = new Intl.DateTimeFormat('en-GB', { year: 'numeric', timeZone: 'Asia/Kolkata' }).format(date);
          return `${dayStr} ${monthStr} ${yearStr}`;
        }
        
        // Return as-is for other formats
        return dateString;
      };

      worksheet.addRow({
        oph_id: row.oph_id,
        current_booking_date: formatDate(row.current_booking_date),
        previous_booking_date: formatDate(row.previous_booking_date),
        original_booking_date: formatDate(row.original_booking_date),
        song_name: row.song_name,
        project_type: row.project_type,
      });
    });

    // Download headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=calendar.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).send("Internal Server Error");
  }
};



const getSongApplicationStatus = async (req, res) => {
  try {
    const rows = await allDataCont.songRegistrationDetails();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Song Application Status");

    // Define columns
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "OPH ID", key: "oph_id", width: 20 },
      { header: "Song ID", key: "song_id", width: 10 },
      { header: "Song Name", key: "song_name", width: 30 },
      { header: "Status Audio", key: "status_audio", width: 20 },
      { header: "Status Video", key: "status_video", width: 20 },
      { header: "Status Payment", key: "status_payment", width: 20 },
      { header: "Overall Status", key: "overall_status", width: 20 },
    ];

    // Add data
    rows.forEach((row) => {
      worksheet.addRow({
        id: row.id,
        oph_id: row.oph_id,
        song_id: row.song_id,
        song_name: row.song_name,
        status_audio: row.status_audio,
        status_video: row.status_video,
        status_payment: row.status_payment,
        overall_status: row.overall_status,
      });
    });

    // Set headers for Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=song_application_status.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).send("Internal Server Error");
  }
};


const getTvPublishing = async (req, res) => {
  try {
    const rows = await allDataCont.tvpublishingDetails();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("TV Publishing");

    // Define columns (audio_url & video_url removed)
    worksheet.columns = [
      { header: "OPH ID", key: "oph_id", width: 20 },
      { header: "Song ID", key: "song_id", width: 10 },
      { header: "Song Name", key: "song_name", width: 30 },
      { header: "Lock", key: "lock", width: 15 },
      { header: "Status", key: "status", width: 20 },
      { header: "Reason", key: "reason", width: 40 },
      { header: "Created At", key: "created_at", width: 20 },
      { header: "Updated At", key: "updated_at", width: 20 },
    ];

    // Add rows
    rows.forEach((row) => {
      worksheet.addRow({
        oph_id: row.oph_id,
        song_id: row.song_id,
        song_name: row.song_name,
        lock: row.lock === 1 ? "Locked" : "Unlocked",
        status: row.status,
        reason: row.reason,
        created_at: row.created_at
          ? new Date(row.created_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            })
          : null,
        updated_at: row.updated_at
          ? new Date(row.updated_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            })
          : null,
      });
    });

    // Set headers for Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=tv_publishing.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).send("Internal Server Error");
  }
};


const getWithdrawals = async (req, res) => {
  try {
    const rows = await allDataCont.withdrawalsDetails();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Withdrawals");

    // Define columns (reason & modified_at removed, created_at at the end)
    worksheet.columns = [
      { header: "Withdrawal ID", key: "withdrawal_id", width: 15 },
      { header: "OPH ID", key: "ophID", width: 20 },
      { header: "Withdraw Amount", key: "withdraw_amount", width: 20 },
      { header: "Status", key: "status", width: 20 },
      { header: "Created At", key: "created_at", width: 25 },
    ];

    // Add data
    rows.forEach((row) => {
      worksheet.addRow({
        withdrawal_id: row.withdrawal_id,
        ophID: row.ophID,
        withdraw_amount: row.withdraw_amount,
        status: row.status,
        created_at: row.created_at
          ? new Date(row.created_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            })
          : null,
      });
    });

    // Download headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=withdrawals.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getTickets = async (req, res) => {
  try {
    const rows = await allDataCont.ticketsDetails();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tickets");

    // Define columns (imageURL removed, created_at at end)
    worksheet.columns = [
      { header: "Ticket Number", key: "ticketNumber", width: 15 },
      { header: "OPH ID", key: "ophID", width: 20 },
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Subject", key: "subject", width: 30 },
      { header: "Description", key: "description", width: 40 },
      { header: "Category", key: "category", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Notes", key: "notes", width: 30 },
      { header: "Created At", key: "created_at", width: 25 },
    ];

    // Add data
    rows.forEach((row) => {
      worksheet.addRow({
        ticketNumber: row.ticketNumber,
        ophID: row.ophID,
        name: row.name,
        email: row.email,
        subject: row.subject,
        description: row.description,
        category: row.category,
        status: row.status,
        notes: row.notes,
        created_at: row.created_at
          ? new Date(row.created_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            })
          : null,
      });
    });

    // Headers for Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=tickets.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  downloadApplicationStatus,
  downloadUserDetails,
  downloadProfessionalDetails,
  getDocumentationDetails,
  getSignUpPayments,
  getbookingsDetails,
  getSongApplicationStatus,
  getTvPublishing,
  getWithdrawals,
  getTickets,
  downloadEventParticipants,
  downloadContactUs,
  downloadSpecialArtistDetails,
  downloadSongsRegister
};