const UserService = require("../services/user/UserService");

const signup = async (req, res) => {
  try {
    const {
      name,
      stageName,
      email,
      contactNumber,
      confirmPassword,
      artistType,
      step,
    } = req.body;

    // Call service to handle all business logic
    const result = await UserService.createUser({
      name,
      stageName,
      email,
      contactNumber,
      password: confirmPassword,
      artistType,
      step: step || 'payment'
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle specific errors
    if (error.message === 'Email or phone already exists') {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

module.exports = { signup };
