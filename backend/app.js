const express = require("express");
const cors = require("cors");
const compression = require("compression");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT;

// Behind nginx / Cloudflare so req.ip and secure cookies behave
app.set("trust proxy", 1);

const server = http.createServer(app);

// Optimize server timeouts
// Node's default server.requestTimeout is 300000ms (5 min) and applies to the
// entire incoming request including multipart body. 1GB video on a slow link
// often exceeds that, so the server stops reading while the browser keeps sending.
server.requestTimeout = 0; // disable — large video uploads (multer → S3) need longer
// Socket inactivity timeout while waiting for the next request on a keep-alive connection
server.timeout = 120000; // 2 minutes idle (not the same as requestTimeout)
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // must be > keepAliveTimeout

// Connect DB (assumed it runs inside connectDB file)
const connectDB = require("./DB/connect");

// Routes
const signinRoute = require("./routes/signin");
const signupRoute = require("./routes/signup");
const professionalDetailsRoute = require("./routes/professional_details");
const documentationDetailsRoute = require("./routes/documentation_details");
const dateBookingRoute = require("./routes/date_booking");
const songResgisterRoute = require("./routes/songs_register");
const songDetailsRoute = require("./routes/audio_details");
const personalDetails = require("./routes/personal_details");
const forgotPassword = require("./routes/forgot_password");
const resetPassword = require("./routes/reset_password");
const changePassword = require("./routes/change_password");
const membership = require("./routes/membership");
const secondaryArtist = require("./routes/secondary_artist");
const videoDetail = require("./routes/video_details");
const eventParticipant = require("./admin/routes/eventParticipant");
const eventBookings = require("./admin/routes/eventBookings");
const artistSpotlight = require("./routes/artist-spotlight");
const homeRoute = require("./routes/home");
const withdraw = require("./routes/withdraw");
const paymentRoute = require("./routes/payment");
const incrementTrafficCounter = require("./routes/increment_traffic_counter");
const spotlight_notes = require("./routes/spotlight_notes");
const notification = require("./routes/notification");
const tvPublishing = require("./routes/tvPublishing");
const increment_form = require("./utils/form_count");
const professions = require("./routes/professions");
const my_epk = require("./routes/my-epk");
const artist_type = require("./routes/sidebar");
const special_artist = require("./routes/special-artist");
const special_artist_song = require("./routes/special-artist-songs");
const contact_us = require("./routes/contact_us");
const song_details = require("./routes/song_details")
const income = require("./routes/income");
const banks = require("./routes/banks");
const navleaderboard = require("./routes/leaderboard")
const artistHash = require("./routes/artist_hash");
const uploadVideo = require("./routes/upload_video");


//Admin route assignment
const adminSignUp = require("./admin/routes/adminSignUp");
const adminSignIn = require("./admin/routes/adminSignIn");
const newSignUp = require("./admin/routes/newSignUp");
const newArtist = require("./admin/routes/newArtist");
const allArtist = require("./admin/routes/allArtist");
const songs = require("./admin/routes/songs");
const events = require("./admin/routes/events");
const payments = require("./admin/routes/payments");
const analytics = require("./admin/routes/analytics");
const tickets = require("./admin/routes/tickets");
const AdminWithdraw = require("./admin/routes/withdraw");
const leaderboard = require("./admin/routes/leaderboard");
const kpi = require("./admin/routes/kpi");
const resource = require("./admin/routes/resource");
const TvPublishing = require("./admin/routes/tvPublishing");
const audioPlatform = require("./admin/routes/audioPlatform");
const adminCalendar = require("./admin/routes/date-booking");
const specialArtistDetails = require("./admin/routes/special-artist-details");
const specialArtistSong = require("./admin/routes/special-artist-songs");
const allData = require("./admin/routes/allData");
const costing = require("./admin/routes/costing");
const songRelease = require("./admin/routes/song_release");
const supportingNumbers = require("./admin/routes/supporting_numbers");
const eventWinner = require("./admin/routes/eventWinner");
const incomeStatus = require("./admin/routes/special-artist-income");
const pageMedia = require("./admin/routes/page_media");

const allowedOrigins = [
  "https://ophcommunity.com",
  "https://ophcommunity.in",
  "https://ophcommunity.org",
  "https://admin.ophcommunity.com",
  "https://admin.ophcommunity.in",
  "https://admin.ophcommunity.org",
  "http://localhost:5173",
  "http://localhost:5174",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// Earliest log for POST /video-details: runs when request headers hit Node (before 1GB body finishes).
// If this never appears in PM2 logs, nginx/Cloudflare blocked the upload — not the app.
app.use((req, res, next) => {
  if (req.method !== "POST") return next();
  const pathOnly = (req.originalUrl || req.url || "").split("?")[0];
  if (pathOnly !== "/video-details" && !pathOnly.endsWith("/video-details")) {
    return next();
  }
  const cl = req.headers["content-length"];
  const mb =
    cl && !Number.isNaN(Number(cl))
      ? (Number(cl) / (1024 * 1024)).toFixed(2)
      : "unknown-chunked-or-missing";
  console.log(
    `[Video Upload][trace-0-headers] ${new Date().toISOString()} | ~${mb} MB | ip=${req.ip} | CL=${cl || "none"}`
  );
  next();
});

// ✅ HANDLE PREFLIGHT EXPLICITLY WITH SAME OPTIONS
app.options("*", cors(corsOptions));

// Enable response compression for faster page loads (gzip)
// Note: Install compression package: npm install compression
try {
  const compression = require('compression');
  app.use(compression({
    level: 6, // Compression level (1-9, 6 is good balance)
    filter: (req, res) => {
      // Don't compress if client doesn't support it or if it's a file upload
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use compression for all other responses
      return compression.filter(req, res);
    }
  }));
  console.log('✅ Response compression enabled');
} catch (error) {
  console.warn('⚠️ Compression middleware not available. Install with: npm install compression');
}

// Optimized body parser limits
// Regular requests: 10MB (fast parsing)
// File upload routes will override this with higher limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static("uploads"));

const io = new Server(server, {
  cors: {
    origin: [
      ...allowedOrigins,
      process.env.ADMIN_URL,
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  },
});

const onlineUsers = new Map();
/** Throttle presigned PUT progress logs per socket+session (browser→S3; bytes never hit Node). */
const presignedProgressLogThrottle = new Map();

io.on("connection", (socket) => {
  socket.on("register", (ophid) => {
    if (!ophid) {
      console.log("Received empty ophid from socket:", socket.id);
      return;
    }

    const trimmedOphid = ophid.trim();
    onlineUsers.set(trimmedOphid, socket.id);
  });

  // Client reports axios PUT progress to S3 (presigned URL); we log it like server-side S3 progress.
  socket.on("presigned-video-upload-progress", (data) => {
    try {
      if (!data || typeof data !== "object") return;
      const ophid = String(data.ophid ?? "").trim();
      if (!ophid) return;
      if (onlineUsers.get(ophid) !== socket.id) return;

      const song_id = data.song_id != null ? String(data.song_id) : "?";
      const pct = Math.min(
        100,
        Math.max(0, Math.round(Number(data.percentage ?? data.percent ?? 0)))
      );
      const loadedMB = Number(data.loadedMB);
      const totalMB = Number(data.totalMB);
      const speed = Number(data.speed ?? 0);

      const key = `${socket.id}:${ophid}:${song_id}`;
      const now = Date.now();
      const prev = presignedProgressLogThrottle.get(key) ?? {
        lastPct: -999,
        lastLog: 0,
      };
      const shouldLog =
        pct >= 100 ||
        pct <= 1 ||
        pct - prev.lastPct >= 5 ||
        now - prev.lastLog >= 2000;
      if (!shouldLog) return;

      presignedProgressLogThrottle.set(key, { lastPct: pct, lastLog: now });
      if (pct >= 100) presignedProgressLogThrottle.delete(key);

      const loadedStr = Number.isFinite(loadedMB) ? loadedMB.toFixed(2) : "?";
      const totalStr = Number.isFinite(totalMB) ? totalMB.toFixed(2) : "?";
      const spdStr = Number.isFinite(speed) ? speed.toFixed(2) : "?";

      console.log(
        `[Video Upload][presigned-PUT→S3] song_id=${song_id} oph_id=${ophid} | ${pct}% | ${loadedStr}/${totalStr} MB | ${spdStr} MB/s`
      );
    } catch (e) {
      // ignore malformed payloads
    }
  });

  socket.on("disconnect", () => {
    for (const k of presignedProgressLogThrottle.keys()) {
      if (k.startsWith(`${socket.id}:`)) presignedProgressLogThrottle.delete(k);
    }
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        console.log(`🗑️ Removed OPHID ${key} on disconnect`);
        break;
      }
    }
    console.log("Socket disconnected:", socket.id);
  });
});

//socket
app.set("onlineUsers", onlineUsers);
app.set("io", io);

// ✅ Mount routes
app.use("/", signupRoute);
app.use("/", signinRoute);
app.use("/", professionalDetailsRoute);
app.use("/", documentationDetailsRoute);
app.use("/", dateBookingRoute);
app.use("/", songResgisterRoute);
app.use("/", songDetailsRoute);
app.use("/", forgotPassword);
app.use("/", resetPassword);
app.use("/", changePassword);
app.use("/", personalDetails);
app.use("/", membership);
app.use("/", secondaryArtist);
app.use("/", videoDetail);
app.use("/", eventParticipant);
app.use("/", eventBookings);
app.use("/artist-spotlight", artistSpotlight);
app.use("/", homeRoute);
app.use("/", paymentRoute);
app.use("/", withdraw);
app.use("/", incrementTrafficCounter);
app.use("/", spotlight_notes);
app.use("/", notification);
app.use("/", tvPublishing);
app.use("/", increment_form);
app.use("/", professions);
app.use("/", my_epk);
app.use("/", artist_type);
app.use("/", special_artist);
app.use("/", special_artist_song);
app.use("/", contact_us);
app.use("/", song_details);
app.use("/", income);
app.use("/", banks);
app.use("/", navleaderboard);
app.use("/", artistHash);
app.use("/", uploadVideo);

//Admin Routes

app.use("/", adminSignUp);
app.use("/", adminSignIn);
app.use("/", newSignUp);
app.use("/", newArtist);
app.use("/", allArtist);
app.use("/", tickets);
app.use("/", songs);
app.use("/", events);
app.use("/", payments);
app.use("/", analytics);
app.use("/", leaderboard);
app.use("/", kpi);
app.use("/", resource);
app.use("/", AdminWithdraw);
app.use("/", TvPublishing);
app.use("/", audioPlatform);
app.use("/admin-calendar", adminCalendar);
app.use("/", specialArtistDetails);
app.use("/", allData);
app.use("/", costing);
app.use("/", specialArtistSong);
app.use("/", songRelease);
app.use("/", supportingNumbers);
app.use("/", eventWinner);
app.use("/", incomeStatus );
app.use("/", pageMedia);
// ✅ Start server
server.listen(port, '0.0.0.0', () => {
  console.log(`Server is listening on port ${port}...`);
});
