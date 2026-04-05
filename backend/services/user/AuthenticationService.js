const jwt = require('jsonwebtoken');

class AuthenticationService {
  /**
   * Generate JWT token for user
   */
  generateToken(userData) {
    return jwt.sign(
      {
        email: userData.email,
        userData: {
          artist: {
            id: userData.ophId,
            name: userData.name,
            stage_name: userData.stageName,
          },
        },
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = new AuthenticationService();




