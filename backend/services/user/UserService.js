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
   * Map step_status database value to route path
   */
  mapStepStatusToRoute(stepStatus) {
    if (!stepStatus) {
      return '/auth/payment';
    }

    const routeMap = {
      'personal_details': '/auth/create-profile/personal-details',
      'professional_details': '/auth/create-profile/professional-details',
      'documentation_details': '/auth/create-profile/documentation-details',
      'payment': '/auth/payment',
    };

    return routeMap[stepStatus] || '/auth/payment';
  }

  /**
   * Normalize status value for comparison (case-insensitive)
   */
  normalizeStatus(status) {
    if (!status) return null;
    return String(status).toLowerCase().trim();
  }

  /**
   * Check if status matches a given value (case-insensitive)
   */
  isStatus(status, value) {
    return this.normalizeStatus(status) === this.normalizeStatus(value);
  }

  /**
   * Check if user has previously filled any forms
   * Returns true if any status is not null/pending (meaning they have submitted data)
   */
  hasPreviouslyFilledForms(user_status, professional_status, documentation_status, payment_status) {
    // If any status exists and is not null/pending, user has filled forms before
    return (
      (user_status && !this.isStatus(user_status, "pending")) ||
      (professional_status && !this.isStatus(professional_status, "pending")) ||
      (documentation_status && !this.isStatus(documentation_status, "pending")) ||
      (payment_status && !this.isStatus(payment_status, "pending"))
    );
  }

  /**
   * Determine where to redirect user after login based on application status
   */
  determineNavigationPath(user, applicationStatus) {
    // If no application status record exists, determine based on step_status
    if (!applicationStatus) {
      console.log("[Navigation] No applicationStatus, using step_status:", user.step_status);
      return this.mapStepStatusToRoute(user.step_status);
    }

    const { user_status, professional_status, documentation_status, payment_status, overall_status } = applicationStatus;
    
    console.log("[Navigation] Application Status:", {
      user_status,
      professional_status,
      documentation_status,
      payment_status,
      overall_status
    });

    // Application completed - go to dashboard
    if (this.isStatus(overall_status, "completed")) {
      console.log("[Navigation] Overall status is completed, redirecting to /dashboard");
      return "/dashboard";
    }

    // PRIORITY 1: Check for rejected steps FIRST (user needs to resubmit)
    // Rejected steps take priority - user must fix these before anything else
    // Check in sequence: user -> professional -> documentation -> payment
    if (this.isStatus(user_status, "rejected")) {
      console.log("[Navigation] User status is rejected, redirecting to /auth/create-profile/personal-details");
      return "/auth/create-profile/personal-details";
    }
    if (this.isStatus(professional_status, "rejected")) {
      console.log("[Navigation] Professional status is rejected, redirecting to /auth/create-profile/professional-details");
      return "/auth/create-profile/professional-details";
    }
    if (this.isStatus(documentation_status, "rejected")) {
      console.log("[Navigation] Documentation status is rejected, redirecting to /auth/create-profile/documentation-details");
      return "/auth/create-profile/documentation-details";
    }
    if (this.isStatus(payment_status, "rejected")) {
      console.log("[Navigation] Payment status is rejected, redirecting to /auth/payment");
      return "/auth/payment";
    }

    // PRIORITY 2: If any step is under review, show status page (user cannot edit while under review)
    if (
      this.isStatus(user_status, "under review") ||
      this.isStatus(professional_status, "under review") ||
      this.isStatus(documentation_status, "under review") ||
      this.isStatus(payment_status, "under review")
    ) {
      console.log("[Navigation] At least one step is under review, redirecting to /auth/profile-status");
      console.log(user);
      
      return user.current_step;
    }

    // PRIORITY 3: If user has previously filled forms and overall_status is not complete,
    // redirect to profile-status instead of form pages
    if (this.hasPreviouslyFilledForms(user_status, professional_status, documentation_status, payment_status)) {
      console.log("[Navigation] User has previously filled forms, redirecting to /auth/profile-status");
      return user.current_step;
    }

    // Find the first incomplete (pending) step and navigate there
    // Steps must be completed in order: user -> professional -> documentation -> payment
    if (this.isStatus(user_status, "pending") || !user_status) {
      return "/auth/create-profile/personal-details";
    }
    
    if (this.isStatus(professional_status, "pending") || !professional_status) {
      // Only allow professional details if user step is approved
      if (this.isStatus(user_status, "approved")) {
        return "/auth/create-profile/professional-details";
      }
      // If user is not approved but professional is pending, still go to personal details
      return "/auth/create-profile/personal-details";
    }
    
    if (this.isStatus(documentation_status, "pending") || !documentation_status) {
      // Only allow documentation if previous steps are approved
      if (this.isStatus(user_status, "approved") && this.isStatus(professional_status, "approved")) {
        return "/auth/create-profile/documentation-details";
      }
      // If previous steps not approved, go to first incomplete step
      if (!this.isStatus(user_status, "approved")) {
        return "/auth/create-profile/personal-details";
      }
      return "/auth/create-profile/professional-details";
    }
    
    if (this.isStatus(payment_status, "pending") || !payment_status) {
      // Only allow payment if all previous steps are approved
      if (
        this.isStatus(user_status, "approved") &&
        this.isStatus(professional_status, "approved") &&
        this.isStatus(documentation_status, "approved")
      ) {
        return "/auth/payment";
      }
      // If previous steps not approved, go to first incomplete step
      if (!this.isStatus(user_status, "approved")) {
        return "/auth/create-profile/personal-details";
      }
      if (!this.isStatus(professional_status, "approved")) {
        return "/auth/create-profile/professional-details";
      }
      return "/auth/create-profile/documentation-details";
    }

    // Default: map step_status to route or go to payment
    return this.mapStepStatusToRoute(user.step_status);
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

