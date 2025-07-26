const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

// Connect DB (assumed it runs inside connectDB file)
const connectDB = require("./DB/connect");

// Routes
const signinRoute = require("./routes/signin");
const signupRoute = require("./routes/signup");
const paymentRoute = require("./routes/payment");
const professionalDetailsRoute = require("./routes/professional_details")
const documentationDetailsRoute = require("./routes/documentation_details")
const dateBookingRoute = require("./routes/date_booking")
const songResgisterRoute= require("./routes/songs_register")
const songDetailsRoute= require("./routes/audio_details")
const personalDetails = require("./routes/personal_details")
const forgotPassword = require("./routes/forgot_password")
const resetPassword = require("./routes/reset_password")
const membership = require("./routes/membership");
const secondaryArtist = require("./routes/secondary_artist")
const videoDetail = require("./routes/video_details");


//Admin route assignment
const adminSignUp = require("./admin/routes/adminSignUp")
const adminSignIn = require("./admin/routes/adminSignIn")
const newSignUp = require("./admin/routes/newSignUp")
const newArtist = require("./admin/routes/newArtist")
const allArtist = require("./admin/routes/allArtist")
const tickets = require("./admin/routes/tickets")
// ✅ Middleware order is important
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// ✅ Mount routes
app.use("/", signupRoute);
app.use("/", signinRoute);
app.use("/", paymentRoute);
app.use("/", professionalDetailsRoute);
app.use("/", documentationDetailsRoute);

app.use("/", dateBookingRoute);
app.use("/", songResgisterRoute);
app.use("/", songDetailsRoute);
app.use("/", forgotPassword);
app.use("/", resetPassword);
app.use("/", personalDetails);
app.use("/",membership);
app.use("/", secondaryArtist);
app.use("/", videoDetail);


//Admin Routes

app.use("/",adminSignUp);
app.use("/",adminSignIn);
app.use("/",newSignUp);
app.use("/",newArtist);
app.use("/",allArtist);
app.use("/",tickets);

// ✅ Start server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
