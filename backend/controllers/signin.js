const user_details = require("../model/signin.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
   
    const ophId = user[0].ophid;
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
            stage_name: dbUser.stage_name
          },
        }
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" });
    

    const result = await user_details.checkRejectedStep(dbUser.ophid);

    const checkRejectedStep = result[0];
    
    if (checkRejectedStep.user_details_status === "rejected") {
      navTo = "/auth/create-profile/personal-details";
    } else if (checkRejectedStep.professional_details_status === "rejected") {
      navTo = "/auth/create-profile/professional-details";
    } else if (checkRejectedStep.document_details_status === "rejected") {
      navTo = "/auth/create-profile/documentation-details";
    }
    else if(checkRejectedStep.user_details_status === "completed" && checkRejectedStep.professional_details_status === "completed" && checkRejectedStep.document_details_status === "completed")
    {
      navTo = "/dashboard";
    } 
    else {
      navTo = dbUser.current_step;
    }

    console.log(navTo);
    
    
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      ophid: dbUser.ophid,
      step: navTo,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { signin };
