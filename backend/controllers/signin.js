const user_details = require("../model/signin.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let navTo = "";
    console.log("Login attempt for email:", email);

    const user = await user_details.findUserByEmail(email);

    if (user.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const dbUser = user[0];
    console.log("User found:", dbUser.ophid);

    const ophId = user[0].ophid;
    const isPasswordValid = await bcrypt.compare(password, dbUser.user_pass);

    if (!isPasswordValid) {
      console.log("Password validation failed for:", email);
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    console.log("Password validated successfully");

    const token = jwt.sign(
      {
        email: email,
        userData: {
          artist: {
            id: ophId,
            name: dbUser.full_name,
            stage_name: dbUser.stage_name,
          },
        },
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    const result = await user_details.checkRejectedStep(dbUser.ophid);
    console.log("checkRejectedStep result:", result);

    if (!result || result.length === 0) {
      console.log("No application status found, using current_step");
      navTo = dbUser.current_step || "/dashboard";
    } else {
      const checkRejectedStep = result[0];
      console.log("Application status:", checkRejectedStep);

      if (
        checkRejectedStep.user_status === "under review" &&
        checkRejectedStep.professional_status === "under review" &&
        checkRejectedStep.documentation_status === "under review" &&
        checkRejectedStep.payment_status === "under review"
      ) {
        navTo = "/auth/profile-status";
      } else if (checkRejectedStep.payment_status === "rejected") {
        navTo = "/auth/payment";
      } else if (checkRejectedStep.user_status === "rejected") {
        navTo = "/auth/create-profile/personal-details";
      } else if (checkRejectedStep.professional_status === "rejected") {
        navTo = "/auth/create-profile/professional-details";
      } else if (checkRejectedStep.documentation_status === "rejected") {
        navTo = "/auth/create-profile/documentation-details";
      } else if (
        checkRejectedStep.user_status === "under review" ||
        checkRejectedStep.professional_status === "under review" ||
        checkRejectedStep.documentation_status === "under review" ||
        checkRejectedStep.payment_status === "under review"
      ) {
        navTo = dbUser.current_step || "/auth/create-profile/personal-details";
      } else if (checkRejectedStep.overall_status === "completed") {
        navTo = "/dashboard";
      } else {
        navTo = dbUser.current_step || "/auth/create-profile/personal-details";
      }
    }

    console.log("Final navTo:", navTo);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      ophid: dbUser.ophid,
      step: navTo,
      artist_type: dbUser.artist_type,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getArtistDetail = async (req, res) => {
  const { ophid } = req.params;
  const artistDetail = await user_details.getArtistDetail(ophid);
  return res.status(200).json({ success: true, data: artistDetail });
};

module.exports = { signin, getArtistDetail };