const UserService = require("../services/user/UserService");
require("dotenv").config();

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Call service to handle all business logic
    const result = await UserService.signin(email, password);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Login error:", error);
    
    // Handle database connection errors specifically
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(503).json({ 
        success: false, 
        message: "Database connection error. Please check database credentials and permissions.",
        error: "Access denied"
      });
    }
    
    // Handle specific errors
    if (error.message === 'User not found') {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ 
        success: false, 
        message: error.message 
    });
    }

    return res.status(500).json({ 
      success: false, 
      message: error.message || "Server error" 
    });
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