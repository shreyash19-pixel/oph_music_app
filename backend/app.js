const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT;

const server = http.createServer(app);
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
const membership = require("./routes/membership");
const secondaryArtist = require("./routes/secondary_artist");
const videoDetail = require("./routes/video_details");
const eventParticipant = require("./admin/routes/eventParticipant");
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
// ✅ Middleware order is important
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174",process.env.ADMIN_URL,process.env.CLIENT_URL],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("register", (ophid) => {
    if (!ophid) {
      console.log("Received empty ophid from socket:", socket.id);
      return;
    }

    const trimmedOphid = ophid.trim();
    onlineUsers.set(trimmedOphid, socket.id);
  });

  socket.on("disconnect", () => {
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
app.use("/", personalDetails);
app.use("/", membership);
app.use("/", secondaryArtist);
app.use("/", videoDetail);
app.use("/", eventParticipant);
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

// ✅ Start server
server.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
