const UserService = require("../services/user/UserService");
const user_details = require("../model/signin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/** DB `current_step` can be NULL; never send null/empty step to the client. */
function coerceLoginStep(step, fallback = "/dashboard") {
  if (step == null) return fallback;
  const s = String(step).trim();
  if (
    s === "" ||
    s.toLowerCase() === "null" ||
    s.toLowerCase() === "undefined"
  ) {
    return fallback;
  }
  return s.startsWith("/") ? s : `/${s}`;
}

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let navTo = "";

    const user = await user_details.findUserByEmail(email);

    if (user.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const dbUser = user[0];

    const ophId = dbUser.oph_id;
    const isPasswordValid = await bcrypt.compare(password, dbUser.user_pass);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // const token = jwt.sign({ email }, process.env.SECRET_KEY, {
    //   expiresIn: "1h",
    // });
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

    const result = await user_details.checkRejectedStep(dbUser.oph_id);

    const checkRejectedStep = result[0];

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
      navTo = dbUser.current_step;
    } else if (checkRejectedStep.overall_status === "completed") {
      navTo = "/dashboard";
    } else {
      navTo = dbUser.current_step;
    }

    navTo = coerceLoginStep(navTo, "/dashboard");

    console.log(navTo);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      ophid: dbUser.oph_id,
      step: navTo,
      artist_type: dbUser.artist_type,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getArtistDetail = async (req, res) => {
  try {
  const { ophid } = req.params;
    const artistDetail = await UserService.getArtistDetail(ophid);
  return res.status(200).json({ success: true, data: artistDetail });
  } catch (error) {
    console.error("Get artist detail error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { signin, getArtistDetail };