const admin_details = require("../model/adminSignUp");
const admin_detail = require("../model/adminSignIn");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    
    const { Name, Email, contactNumber, confirmPassword} =
      req.body;    

    // Check if user already exists
    const userExists = await admin_details.getEmailAndNumber(
      Email,
      contactNumber
    );
    if (userExists.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email or phone already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(confirmPassword, 10);

   
    
    // Insert user
    const dbResponse = await admin_details.createUser(
      Name,
      Email,
      contactNumber,
      hashedPassword,
    );

   const user = await admin_detail.findUserByEmail(Email);
   
       if (user.length === 0) {
         return res
           .status(400)
           .json({ success: false, message: "User not found" });
       }
   
       const dbUser = user[0];
       console.log(dbUser);


    // const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: "1h" });
    const authVersion = Number(dbUser.auth_version ?? 1);
    const token = jwt.sign(
      {
        email: Email,
        role: dbUser.Role,
        av: authVersion,
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );
    if (dbResponse) {

      return res.status(201).json({ success: true, message: "Signup success", token: token});
    }

    return res.status(500).json({ success: false, message: "Server error" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllPersonal = async (req, res) => {
  try {
    const bookings = await admin_details.getFullPersonal()
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = { signup, getAllPersonal };