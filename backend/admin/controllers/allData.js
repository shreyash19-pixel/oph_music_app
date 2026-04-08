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
      // DB uses oph_id / created_at / updated_at; Excel columns use OPH_ID / createdAt / updatedAt
      const mapped = {
        OPH_ID: row.OPH_ID ?? row.oph_id ?? "",
        user_status: row.user_status ?? "",
        professional_status: row.professional_status ?? "",
        documentation_status: row.documentation_status ?? "",
        payment_status: row.payment_status ?? "",
        overall_status: row.overall_status ?? "",
        createdAt: formatDate(row.createdAt ?? row.created_at),
        updatedAt: formatDate(row.updatedAt ?? row.updated_at),
      };
      const newRow = worksheet.addRow(mapped);

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

      applyStyle(newRow.getCell("user_status"), mapped.user_status);
      applyStyle(newRow.getCell("professional_status"), mapped.professional_status);
      applyStyle(newRow.getCell("documentation_status"), mapped.documentation_status);
      applyStyle(newRow.getCell("payment_status"), mapped.payment_status);
      applyStyle(newRow.getCell("overall_status"), mapped.overall_status);
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
    const rows = await allDataCont.eventParticipantsDetails();

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No event participants found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Event Participants");

    worksheet.columns = [
      { header: "Source", key: "source", width: 12 },
      { header: "Record ID", key: "record_id", width: 14 },
      { header: "OPH ID", key: "oph_id", width: 22 },
      { header: "Event ID", key: "event_id", width: 12 },
      { header: "Status", key: "status", width: 18 },
      { header: "Created At", key: "created_at", width: 14 },
      { header: "Updated At", key: "updated_at", width: 14 },
      { header: "Booking ref", key: "booking_reference", width: 22 },
      { header: "Name (outside only)", key: "participant_name", width: 28 },
      { header: "Email (outside only)", key: "email", width: 32 },
    ];

    rows.forEach((row) => {
      const newRow = worksheet.addRow({
        source: row.source,
        record_id: row.record_id,
        oph_id: row.oph_id,
        event_id: row.event_id,
        status: row.status,
        created_at: row.created_at ? formatDateOnlyIST(row.created_at) : "",
        updated_at: row.updated_at ? formatDateOnlyIST(row.updated_at) : "",
        booking_reference: row.booking_reference ?? "",
        participant_name: row.participant_name ?? "",
        email: row.email ?? "",
      });

      const statusCell = newRow.getCell("status");
      const s = String(row.status || "").toLowerCase();
      if (s === "rejected") {
        statusCell.font = { color: { argb: "FF0000" }, bold: true };
      } else if (s === "accepted" || s === "approved") {
        statusCell.font = { color: { argb: "228B22" }, bold: true };
      } else if (s === "under review" || s === "pending") {
        statusCell.font = { color: { argb: "FF8C00" }, bold: true };
      }
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

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
      { header: "Oph ID", key: "oph_id", width: 22 },
      { header: "Project Type", key: "project_type", width: 25 },
      { header: "Song Name", key: "Song_name", width: 40 },
      { header: "Release Date", key: "release_date", width: 14 },
      { header: "Lyrics Services", key: "Lyrics_services", width: 20 },
      { header: "Available on Music Platform", key: "availability_on_music_platform", width: 25 },
      { header: "Status", key: "status", width: 20 },
      { header: "Created At", key: "created_at", width: 14 },
      { header: "Updated At", key: "updated_at", width: 14 },
    ];

    /** Date only (no time), IST — for release / created / updated in the sheet */
    const formatDateOnly = (date) => {
      if (!date) return "";
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(new Date(date));
    };

    // Add rows and apply conditional formatting
    rows.forEach((row) => {
      const oph =
        row.oph_id != null && row.oph_id !== ""
          ? row.oph_id
          : row.OPH_ID != null && row.OPH_ID !== ""
            ? row.OPH_ID
            : "";
      const newRow = worksheet.addRow({
        song_id: row.song_id,
        oph_id: oph,
        project_type: row.project_type,
        Song_name: row.Song_name,
        release_date: formatDateOnly(row.release_date),
        Lyrics_services: row.Lyrics_services ? "Yes" : "No",
        availability_on_music_platform: row.availability_on_music_platform ? "Yes" : "No",
        status: row.status,
        created_at: formatDateOnly(row.created_at ?? row.createdAt),
        updated_at: formatDateOnly(row.updated_at ?? row.updatedAt),
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

const formatDateOnlyIST = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
};

const isDateColumnKey = (key) => {
  const k = String(key).toLowerCase();
  return k === "created_at" || k === "updated_at" || k.endsWith("_at");
};

/** Columns excluded from Audio Details export (matches app language/genre UI). */
const OMIT_AUDIO_DETAIL_KEYS = new Set([
  "lyrics",
  "audio_url",
  "reject_reason",
]);

const AUDIO_LANGUAGE_ID_TO_LABEL = {
  1: "English",
  2: "Hindi",
  3: "Marathi",
};

function audioLanguageToDisplay(val) {
  if (val == null || val === "") return "";
  const n = Number(String(val).trim());
  if (Number.isFinite(n) && AUDIO_LANGUAGE_ID_TO_LABEL[n]) {
    return AUDIO_LANGUAGE_ID_TO_LABEL[n];
  }
  const s = String(val).trim();
  const lower = s.toLowerCase();
  if (["english", "hindi", "marathi"].includes(lower)) {
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  return s;
}

function columnHeaderLabel(key) {
  const k = String(key);
  if (k.toLowerCase() === "language") return "Language";
  return k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function addAudioDetailsSheet(workbook, rows) {
  const first = rows[0];
  const rawKeys = Object.keys(first).filter(
    (k) => !OMIT_AUDIO_DETAIL_KEYS.has(String(k).toLowerCase())
  );
  const preferredOrder = [
    "song_id",
    "OPH_ID",
    "oph_id",
    "Song_name",
    "language",
    "genre",
    "sub_genre",
    "mood",
    "primary_artist",
    "status",
    "created_at",
    "updated_at",
  ];
  const orderedKeys = [
    ...preferredOrder.filter((k) => rawKeys.includes(k)),
    ...rawKeys.filter((k) => !preferredOrder.includes(k)),
  ];

  const worksheet = workbook.addWorksheet("Audio Details");
  worksheet.columns = orderedKeys.map((k) => ({
    header: columnHeaderLabel(k),
    key: k,
    width: Math.min(48, Math.max(14, String(k).length + 6)),
  }));

  rows.forEach((row) => {
    const obj = {};
    orderedKeys.forEach((k) => {
      let v = row[k];
      if (String(k).toLowerCase() === "language") {
        obj[k] = audioLanguageToDisplay(v);
      } else if (v != null && v !== "" && isDateColumnKey(k)) {
        try {
          obj[k] = formatDateOnlyIST(v);
        } catch {
          obj[k] = v;
        }
      } else {
        obj[k] = v;
      }
    });
    worksheet.addRow(obj);
  });
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { horizontal: "center" };
}

/** Columns omitted from Video Details Excel export. */
const VIDEO_DETAILS_SHEET_OMIT_KEYS = [
  "image_url",
  "video_url",
  "reject_reason",
];

function addGenericSheetFromRows(workbook, sheetName, rows, omitKeyList = []) {
  const omit = new Set(omitKeyList.map((k) => String(k).toLowerCase()));
  const keys = Object.keys(rows[0]).filter(
    (k) => !omit.has(String(k).toLowerCase())
  );
  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.columns = keys.map((k) => ({
    header: k
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    key: k,
    width: Math.min(48, Math.max(14, k.length + 6)),
  }));
  rows.forEach((row) => {
    const obj = {};
    keys.forEach((k) => {
      const v = row[k];
      if (v != null && v !== "" && isDateColumnKey(k)) {
        try {
          obj[k] = formatDateOnlyIST(v);
        } catch {
          obj[k] = v;
        }
      } else {
        obj[k] = v;
      }
    });
    worksheet.addRow(obj);
  });
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { horizontal: "center" };
}

const downloadAudioDetailsExcel = async (req, res) => {
  try {
    const rows = await allDataCont.getAllAudioDetails();
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No audio details found" });
    }
    const workbook = new ExcelJS.Workbook();
    addAudioDetailsSheet(workbook, rows);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=audio_details.xlsx"
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error downloading Audio Details Excel:", error);
    res.status(500).json({ error: "Failed to download Excel file" });
  }
};

const downloadVideoDetailsExcel = async (req, res) => {
  try {
    const rows = await allDataCont.getAllVideoDetails();
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No video details found" });
    }
    const workbook = new ExcelJS.Workbook();
    addGenericSheetFromRows(
      workbook,
      "Video Details",
      rows,
      VIDEO_DETAILS_SHEET_OMIT_KEYS
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=video_details.xlsx"
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error downloading Video Details Excel:", error);
    res.status(500).json({ error: "Failed to download Excel file" });
  }
};

const downloadUserDetails = async (req, res) => {
  try {
    const rows = await allDataCont.getAllUserDetails();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Personal Details");

    worksheet.columns = [
      { header: "OPH_ID", key: "OPH_ID", width: 20 },
      { header: "Full Name", key: "full_name", width: 25 },
      { header: "Stage Name", key: "stage_name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Contact Number", key: "contact_number", width: 15 },
      { header: "Artist Type", key: "artist_type", width: 20 },
      { header: "Personal Photo", key: "personal_photo", width: 30 },
      { header: "Location", key: "location", width: 20 },
      { header: "Created At", key: "createdAt", width: 14 },
      { header: "Updated At", key: "updatedAt", width: 14 },
    ];

    rows.forEach((row) => {
      // user_details: oph_id, created_at, updated_at (snake_case from MySQL)
      const createdRaw = row.created_at ?? row.createdAt;
      const updatedRaw =
        row.updated_at ?? row.updatedAt ?? row.Updated_at ?? row.UpdatedAt;
      worksheet.addRow({
        OPH_ID: row.OPH_ID ?? row.oph_id ?? row.ophid ?? "",
        full_name: row.full_name ?? row.Full_name ?? "",
        stage_name: row.stage_name ?? row.Stage_name ?? "",
        email: row.email ?? row.Email ?? "",
        contact_number:
          row.contact_number ?? row.contact_num ?? row.Contact_number ?? "",
        artist_type: row.artist_type ?? row.Artist_type ?? "",
        personal_photo: row.personal_photo ?? "",
        location: row.location ?? row.Location ?? "",
        createdAt: createdRaw ? formatDateOnlyIST(createdRaw) : "",
        updatedAt: updatedRaw ? formatDateOnlyIST(updatedRaw) : "",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=personal_details.xlsx"
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
        { header: "Created At", key: "CreatedAt", width: 14 },
        { header: "Updated At", key: "UpdatedAt", width: 14 },
      ];
  
      rows.forEach((row) => {
        const monthly =
          row.experience_monthly ??
          row.ExperienceMonthly ??
          0;
        const n = Number(monthly);
        const safe = Number.isFinite(n) ? n : 0;
        const years = Math.floor(safe / 12);
        const months = safe % 12;

        worksheet.addRow({
          OPH_ID: row.oph_id ?? row.OPH_ID ?? "",
          Profession: row.profession ?? row.Profession ?? "",
          Bio: row.bio ?? row.Bio ?? "",
          SpotifyLink: row.spotify_link ?? row.SpotifyLink ?? "",
          InstagramLink: row.instagram_link ?? row.InstagramLink ?? "",
          FacebookLink: row.facebook_link ?? row.FacebookLink ?? "",
          AppleMusicLink: row.apple_music_link ?? row.AppleMusicLink ?? "",
          ExperienceYears: years,
          ExperienceMonths: months,
          SongsPlanningCount:
            row.songs_planning_count ?? row.SongsPlanningCount ?? "",
          SongsPlanningType:
            row.songs_planning_type ?? row.SongsPlanningType ?? "",
          CreatedAt: (() => {
            const raw = row.created_at ?? row.CreatedAt;
            return raw ? formatDateOnlyIST(raw) : "";
          })(),
          UpdatedAt: (() => {
            const raw = row.updated_at ?? row.UpdatedAt ?? row.Updated_at;
            return raw ? formatDateOnlyIST(raw) : "";
          })(),
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
      { header: "Agreement", key: "AgreementAccepted", width: 18 },
      { header: "Created At", key: "CreatedAt", width: 14 },
      { header: "Updated At", key: "UpdatedAt", width: 14 },
    ];

    const isAgreementTicked = (raw) => {
      if (raw === null || raw === undefined) return false;
      if (typeof raw === "boolean") return raw;
      if (typeof raw === "number") return raw !== 0 && !Number.isNaN(raw);
      if (typeof raw === "bigint") return raw !== 0n;
      if (Buffer.isBuffer(raw) && raw.length > 0) return raw[0] !== 0;
      const s = String(raw).trim().toLowerCase();
      if (["1", "true", "yes", "on", "ticked"].includes(s)) return true;
      if (["0", "false", "no", "off", ""].includes(s)) return false;
      const n = Number(raw);
      return !Number.isNaN(n) && n !== 0;
    };

    // Add rows — DB uses oph_id, bank_name, … (see model/documentation_details.js)
    rows.forEach((row) => {
      const oph =
        row.oph_id ?? row.OPH_ID ?? "";
      const bank =
        row.bank_name ?? row.BankName ?? "";
      const holder =
        row.account_holder_name ?? row.AccountHolderName ?? "";
      const acct =
        row.account_number ?? row.AccountNumber ?? "";
      const ifsc =
        row.ifsc_code ?? row.IFSCCode ?? "";
      const agreedRaw =
        row.agreement_accepted ?? row.AgreementAccepted;
      const agreedStr = isAgreementTicked(agreedRaw)
        ? "TICKED"
        : "NOT TICKED";
      const createdRaw = row.created_at ?? row.CreatedAt;
      const updatedRaw =
        row.updated_at ?? row.UpdatedAt ?? row.Updated_at ?? row.updatedAt;

      worksheet.addRow({
        OPH_ID: oph,
        BankName: bank,
        AccountHolderName: holder,
        AccountNumber: acct,
        IFSCCode: ifsc,
        AgreementAccepted: agreedStr,
        CreatedAt: createdRaw ? formatDateOnlyIST(createdRaw) : "",
        UpdatedAt: updatedRaw ? formatDateOnlyIST(updatedRaw) : "",
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

    if (!Array.isArray(rows)) {
      console.error("Payment details query returned non-array result:", rows);
      return res.status(500).json({ error: "Failed to fetch payment details" });
    }

    const formatDateTimeIST = (val) => {
      if (!val) return "";
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const formatDateIST = (val) => {
      if (!val) return "";
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const reviewLabel = (raw) => {
      if (raw === null || raw === undefined || raw === "") return "";
      if (raw === true || raw === 1 || raw === "1") return "Yes";
      if (raw === false || raw === 0 || raw === "0") return "No";
      if (Buffer.isBuffer(raw) && raw.length > 0) return raw[0] ? "Yes" : "No";
      return String(raw);
    };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("All Payments");

    worksheet.columns = [
      { header: "OPH ID", key: "oph_id", width: 18 },
      { header: "Transaction ID", key: "transaction_id", width: 22 },
      { header: "Date", key: "date_created", width: 22 },
      { header: "Review", key: "review", width: 10 },
      { header: "Status", key: "status", width: 16 },
      { header: "From", key: "from_source", width: 32 },
      { header: "Song ID", key: "song_id", width: 10 },
      { header: "Event ID", key: "event_id", width: 10 },
      { header: "Reject Reason", key: "reject_reason", width: 36 },
      { header: "Release Date", key: "release_date", width: 16 },
      { header: "Reject For", key: "reject_for", width: 14 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "Updated At", key: "updated_at", width: 22 },
    ];

    rows.forEach((row) => {
      worksheet.addRow({
        oph_id: row.oph_id ?? row.OPH_ID ?? "",
        transaction_id: row.transaction_id ?? row.Transaction_ID ?? "",
        date_created: formatDateTimeIST(
          row.created_at ?? row.createdAt ?? row.CreatedAt
        ),
        review: reviewLabel(row.review ?? row.Review),
        status: row.status ?? row.Status ?? "",
        from_source: row.from_source ?? row.From ?? "",
        song_id:
          row.song_id != null && row.song_id !== ""
            ? row.song_id
            : row.Song_ID ?? "",
        event_id:
          row.event_id != null && row.event_id !== ""
            ? row.event_id
            : row.Event_ID ?? "",
        reject_reason: row.reject_reason ?? row.rejectReason ?? "",
        release_date: formatDateIST(
          row.release_date ?? row.Release_date
        ),
        reject_for:
          row.reject_for != null && row.reject_for !== ""
            ? row.reject_for
            : "",
        amount:
          row.amount !== undefined && row.amount !== null ? row.amount : "",
        updated_at: formatDateTimeIST(
          row.updated_at ?? row.updatedAt ?? row.UpdatedAt
        ),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=all_payments.xlsx"
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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bookings");

    worksheet.columns = [
      { header: "OPH ID", key: "oph_id", width: 20 },
      { header: "Block Date", key: "block_date", width: 22 },
      { header: "Changed Date", key: "changed_date", width: 22 },
      { header: "Current Date", key: "current_date", width: 22 },
      { header: "Song Name", key: "song_name", width: 20 },
      { header: "Project Type", key: "project_type", width: 20 },
    ];

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
        oph_id: row.oph_id ?? "",
        block_date: formatDate(row.original_booking_date),
        changed_date: formatDate(row.previous_booking_date),
        current_date: formatDate(row.current_booking_date),
        song_name: row.song_name ?? "",
        project_type: row.project_type ?? "",
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

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "No unlocked TV publishing rows found",
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("TV Publishing");

    // Unlocked entries only (`lock` = 1). Oph ID from OPH_ID / oph_id.
    worksheet.columns = [
      { header: "Oph ID", key: "oph_id", width: 22 },
      { header: "Song ID", key: "song_id", width: 10 },
      { header: "Song Name", key: "song_name", width: 30 },
      { header: "Status", key: "status", width: 20 },
      { header: "Reason", key: "reason", width: 40 },
      { header: "Created At", key: "created_at", width: 14 },
      { header: "Updated At", key: "updated_at", width: 14 },
    ];

    rows.forEach((row) => {
      const oph =
        row.OPH_ID != null && row.OPH_ID !== ""
          ? row.OPH_ID
          : row.oph_id != null && row.oph_id !== ""
            ? row.oph_id
            : "";
      worksheet.addRow({
        oph_id: oph,
        song_id: row.song_id,
        song_name: row.song_name ?? "",
        status: row.status,
        reason: row.reason,
        created_at: row.created_at ? formatDateOnlyIST(row.created_at) : "",
        updated_at: row.updated_at ? formatDateOnlyIST(row.updated_at) : "",
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

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

    worksheet.columns = [
      { header: "Withdrawal ID", key: "withdrawal_id", width: 15 },
      { header: "OPH ID", key: "oph_id", width: 22 },
      { header: "Withdraw Amount", key: "withdraw_amount", width: 18 },
      { header: "Status", key: "status", width: 18 },
      { header: "Created At", key: "created_at", width: 14 },
    ];

    rows.forEach((row) => {
      const oph =
        row.OPH_ID != null && row.OPH_ID !== ""
          ? row.OPH_ID
          : row.oph_id != null && row.oph_id !== ""
            ? row.oph_id
            : row.ophID != null && row.ophID !== ""
              ? row.ophID
              : "";
      worksheet.addRow({
        withdrawal_id: row.withdrawal_id,
        oph_id: oph,
        withdraw_amount: row.withdraw_amount,
        status: row.status,
        created_at: row.created_at ? formatDateOnlyIST(row.created_at) : "",
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

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

    // imageURL omitted. DB column is `createdAt` (see tickets table).
    worksheet.columns = [
      { header: "Ticket Number", key: "ticketNumber", width: 16 },
      { header: "OPH ID", key: "oph_id", width: 22 },
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Subject", key: "subject", width: 30 },
      { header: "Description", key: "description", width: 40 },
      { header: "Category", key: "category", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Notes", key: "notes", width: 30 },
      { header: "Created At", key: "created_at", width: 14 },
    ];

    rows.forEach((row) => {
      const oph =
        row.ophID != null && row.ophID !== ""
          ? row.ophID
          : row.OPH_ID != null && row.OPH_ID !== ""
            ? row.OPH_ID
            : row.oph_id != null && row.oph_id !== ""
              ? row.oph_id
              : "";
      const createdRaw = row.createdAt ?? row.created_at;
      worksheet.addRow({
        ticketNumber: row.ticketNumber,
        oph_id: oph,
        name: row.name,
        email: row.email,
        subject: row.subject,
        description: row.description,
        category: row.category,
        status: row.status,
        notes: row.notes,
        created_at: createdRaw ? formatDateOnlyIST(createdRaw) : "",
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

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
  downloadSongsRegister,
  downloadAudioDetailsExcel,
  downloadVideoDetailsExcel
};