const UserService = require("../services/user/UserService");
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
    const result = await UserService.signin(email, password);

    const step = coerceLoginStep(result.step, "/dashboard");
    console.log(step);

    return res.status(200).json({
      success: true,
      message: result.message,
      token: result.token,
      ophid: result.ophid,
      step,
      artist_type: result.artist_type,
    });
  } catch (err) {
    if (err.message === "User not found") {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    if (err.message === "Invalid credentials") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
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
