const db = require('../../DB/connect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApplicationStatusService = require('../application/ApplicationStatusService');
const userModel = require('../../model/user');

class UserService {
  /**
   * Generate OPH_ID based on artist type
   */
  generateOPHId(artistType, existingArtists, maxCount) {
    let id = "";

    if (artistType === "Independent artist") {
      if (existingArtists.length === 0) {
        id = "OPH-CAN-IA-01";
      } else {
        id = `OPH-CAN-IA-0${maxCount + 1}`;
      }
    } else if (artistType === "Special artist") {
      if (existingArtists.length === 0) {
        id = "OPH-CAN-SA-01";
      } else {
        id = `OPH-CAN-SA-0${maxCount + 1}`;
      }
    }

    return id;
  }

  /**
   * Create a new user with transaction management
   */
  async createUser(userData) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const { name, stageName, email, contactNumber, password, artistType, step } = userData;

      // 1. Check if user already exists
      const existingUsers = await userModel.getEmailAndNumber(connection, email, contactNumber);

      if (existingUsers.length > 0) {
        throw new Error('Email or phone already exists');
      }

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Get existing artists of same type for OPH_ID generation
      const existingArtists = await userModel.getUsersByArtistType(connection, artistType);

      // 4. Calculate max count for OPH_ID
      let maxCount = 0;
      if (existingArtists.length > 0) {
        const artistNums = existingArtists.map(art => {
          const lastDigit = art.oph_id.split("-")[3];
          return parseInt(lastDigit.replace("0", "")) || 0;
        });
        maxCount = Math.max(...artistNums);
      }

      // 5. Generate OPH_ID
      const ophId = this.generateOPHId(artistType, existingArtists, maxCount);

      // 6. Create user in user_details
      await userModel.createUser(connection, ophId, name, stageName, email, contactNumber, hashedPassword, artistType, step || 'payment');

      // 7. Initialize application_status record
      await ApplicationStatusService.initializeApplicationStatus(connection, ophId);

      // 8. Generate JWT token
      const token = jwt.sign(
        {
          email: email,
          userData: {
            artist: {
              id: ophId,
              name: name,
              stage_name: stageName,
            },
          },
        },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );

      await connection.commit();

      return {
        success: true,
        ophId: ophId,
        token: token,
        message: "Signup success"
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Authenticate user and return login information
   */
  async signin(email, password) {
    // No transaction needed for read-only operations
    const connection = await db.getConnection();
    
    try {
      // 1. Find user by email
      const users = await userModel.findUserByEmail(connection, email);

      if (users.length === 0) {
        throw new Error('User not found');
      }

      const user = users[0];

      // 2. Verify password
      const isPasswordValid = await bcrypt.compare(password, user.user_pass);

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // 3. Get application status for navigation logic
      const applicationStatus = await ApplicationStatusService.getApplicationStatus(connection, user.oph_id);

      // 4. Determine navigation path based on application status
      const navTo = this.determineNavigationPath(user, applicationStatus);

      // 5. Generate JWT token
      const token = jwt.sign(
        {
          email: email,
          userData: {
            artist: {
              id: user.oph_id,
              name: user.full_name,
              stage_name: user.stage_name,
            },
          },
        },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );

      return {
        success: true,
        token: token,
        ophid: user.oph_id,
        step: navTo,
        artist_type: user.artist_type,
        message: "Login successful"
      };

    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Determine where to redirect user after login based on application status
   */
  determineNavigationPath(user, applicationStatus) {
    if (!applicationStatus) {
      return user.step_status || '/auth/payment';
    }

    const { user_status, professional_status, documentation_status, payment_status, overall_status } = applicationStatus;

    // All steps under review - show status page
    if (
      user_status === "under review" &&
      professional_status === "under review" &&
      documentation_status === "under review" &&
      payment_status === "under review"
    ) {
      return "/auth/profile-status";
    }

    // Check for rejected steps (priority order)
    if (payment_status === "rejected") {
      return "/auth/payment";
    }
    if (user_status === "rejected") {
      return "/auth/create-profile/personal-details";
    }
    if (professional_status === "rejected") {
      return "/auth/create-profile/professional-details";
    }
    if (documentation_status === "rejected") {
      return "/auth/create-profile/documentation-details";
    }

    // Any step under review - go to current step
    if (
      user_status === "under review" ||
      professional_status === "under review" ||
      documentation_status === "under review" ||
      payment_status === "under review"
    ) {
      return user.step_status || '/auth/payment';
    }

    // Application completed - go to dashboard
    if (overall_status === "completed") {
      return "/dashboard";
    }

    // Default to current step
    return user.step_status || '/auth/payment';
  }

  /**
   * Get artist details by OPH_ID
   */
  async getArtistDetail(ophId) {
    const connection = await db.getConnection();
    
    try {
      const applicationStatus = await ApplicationStatusService.getApplicationStatus(connection, ophId);
      
      if (!applicationStatus) {
        return [];
      }

      return [{ overall_status: applicationStatus.overall_status }];
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new UserService();

