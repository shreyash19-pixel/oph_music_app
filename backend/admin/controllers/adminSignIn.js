const admin_details = require("../model/adminSignIn");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let navTo = "";

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

    // const token = jwt.sign({ email }, process.env.SECRET_KEY, {
    //   expiresIn: "1h",
    // });
    const authVersion = Number(dbUser.auth_version ?? 1);
    const token = jwt.sign(
      {
        email: email,
        role: dbUser.Role,
        av: authVersion,
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );
    

    
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
    });
  } catch (err) {
    console.error("Login error:", err);
    
    // Handle database connection errors specifically
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(503).json({ 
        success: false, 
        message: "Database connection error. Please check database credentials and permissions.",
        error: "Access denied"
      });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateAdminRole = async (req, res) => {
  try {
    const { email, newRole } = req.body;

    // Check if required fields are provided
    if (!email || !newRole) {
      return res.status(400).json({
        success: false,
        message: "Email and newRole are required.",
      });
    }

    // Update role in DB
    const result = await admin_details.updateRoleByEmail(email,newRole)

    // Check if any row was affected
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found or role not updated.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role updated successfully.",
    });

  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating role.",
    });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const row = await admin_details.getProfileByEmail(email);
    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found",
      });
    }

    const name = row.Name ?? row.name ?? null;
    const rowEmail = row.Email ?? row.email ?? null;
    const contactNumber =
      row.ContactNumber ?? row.contact_number ?? row.contactNumber ?? null;
    const role = row.Role ?? row.role ?? null;

    return res.status(200).json({
      success: true,
      data: {
        name,
        email: rowEmail,
        contactNumber,
        role,
      },
    });
  } catch (err) {
    console.error("getAdminProfile error:", err);
    return res.status(500).json({
      success: false,
      message: "Could not load profile",
    });
  }
};

module.exports = { signin, updateAdminRole, getAdminProfile };
