const admin_details = require("../model/adminSignIn");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await admin_details.findUserByEmail(email);

    if (user.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const dbUser = user[0];

    const isPasswordValid = await bcrypt.compare(password, dbUser.Password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // ✅ CREATE JWT
    const token = jwt.sign(
      {
        email: email,
        role: dbUser.Role
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    // ✅ ✅ ✅ SET COOKIE HERE — THIS IS WHAT YOU WERE MISSING
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: true,        // ✅ REQUIRED because you are on HTTPS
      sameSite: "none",    // ✅ REQUIRED because frontend is on different subdomain
      maxAge: 24 * 60 * 60 * 1000
    });

    // ✅ DO NOT return token in JSON anymore
    return res.status(200).json({
      success: true,
      message: "Login successful"
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { signin };
