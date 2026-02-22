const db = require('../../DB/connect');
const applicationStatusModel = require('../../model/applicationStatus');

class ApplicationStatusService {
  /**
   * Initialize application_status record for new user
   */
  async initializeApplicationStatus(connection, ophId) {
    try {
      await applicationStatusModel.createApplicationStatus(connection, ophId);
    } catch (error) {
      // If record already exists, that's okay
      if (error.code !== 'ER_DUP_ENTRY') {
        throw error;
      }
    }
  }

  /**
   * Get application status for a user
   */
  async getApplicationStatus(connection, ophId) {
    const rows = await applicationStatusModel.getApplicationStatus(connection, ophId);
    return rows[0] || null;
  }

  /**
   * Update individual step status
   */
  async updateStepStatus(connection, ophId, step, status, rejectReason = null) {
    let statusField = '';

    console.log(ophId + " " +  step + " " + status);
    

    switch (step) {
      case 'personal_details':
      case 'user':
        statusField = 'user_status';
        break;
      case 'professional_details':
      case 'professional':
        statusField = 'professional_status';
        break;
      case 'documentation_details':
      case 'documentation':
        statusField = 'documentation_status';
        break;
      case 'payment':
        statusField = 'payment_status';
        break;
      default:
        throw new Error(`Invalid step: ${step}`);
    }

    // Update the specific status field
    await connection.execute(
      `UPDATE application_status 
       SET ${statusField} = ?, updated_at = NOW() 
       WHERE oph_id = ?`,
      [status, ophId]
    );

    // Recalculate overall status
    await this.recalculateOverallStatus(connection, ophId);
  }

  /**
   * Recalculate overall_status based on individual step statuses
   */
  async recalculateOverallStatus(connection, ophId) {
    // Get current statuses
    const [rows] = await connection.execute(
      'SELECT user_status, professional_status, documentation_status, payment_status, overall_status FROM application_status WHERE oph_id = ?',
      [ophId]
    );

    if (rows.length === 0) {
      return;
    }

    const { user_status, professional_status, documentation_status, payment_status, overall_status: currentOverallStatus } = rows[0];

    // Calculate new overall status
    let newOverallStatus = 'pending';

    // If any step is rejected, overall is rejected
    if (
      user_status === 'rejected' ||
      professional_status === 'rejected' ||
      documentation_status === 'rejected' ||
      payment_status === 'rejected'
    ) {
      newOverallStatus = 'rejected';
    }
    // If all steps are approved, overall is completed
    else if (
      user_status === 'approved' &&
      professional_status === 'approved' &&
      documentation_status === 'approved' &&
      payment_status === 'approved'
    ) {
      newOverallStatus = 'completed';
    }
    // If any step is under review, overall is under review
    else if (
      user_status === 'under review' ||
      professional_status === 'under review' ||
      documentation_status === 'under review' ||
      payment_status === 'under review'
    ) {
      newOverallStatus = 'under review';
    }
    // Otherwise keep current status or default to pending
    else {
      newOverallStatus = currentOverallStatus || 'pending';
    }

    // Only update if status changed
    if (newOverallStatus !== currentOverallStatus) {
      await connection.execute(
        'UPDATE application_status SET overall_status = ?, updated_at = NOW() WHERE oph_id = ?',
        [newOverallStatus, ophId]
      );
    }

    return newOverallStatus;
  }

  /**
   * Sync application status from all step tables
   * This ensures application_status is in sync with actual step data
   */
  async syncApplicationStatus(connection, ophId) {
    // Get statuses from individual step tables
    const [userDetails] = await connection.execute(
      'SELECT step_status FROM user_details WHERE oph_id = ?',
      [ophId]
    );

    const [professionalDetails] = await connection.execute(
      'SELECT step_status FROM professional_details WHERE oph_id = ?',
      [ophId]
    );

    const [documentationDetails] = await connection.execute(
      'SELECT step_status FROM documentation_details WHERE oph_id = ?',
      [ophId]
    );

    const [paymentDetails] = await connection.execute(
      'SELECT status FROM payments WHERE oph_id = ? AND from_source = "Registration" ORDER BY created_at DESC LIMIT 1',
      [ophId]
    );

    // Map step_status to application_status format
    const userStatus = this.mapStepStatusToApplicationStatus(userDetails[0]?.step_status);
    const professionalStatus = this.mapStepStatusToApplicationStatus(professionalDetails[0]?.step_status);
    const documentationStatus = this.mapStepStatusToApplicationStatus(documentationDetails[0]?.step_status);
    const paymentStatus = paymentDetails[0]?.status || 'pending';

    // Update application_status
    await connection.execute(
      `UPDATE application_status 
       SET user_status = ?, 
           professional_status = ?, 
           documentation_status = ?, 
           payment_status = ?,
           updated_at = NOW()
       WHERE oph_id = ?`,
      [userStatus, professionalStatus, documentationStatus, paymentStatus, ophId]
    );

    // Recalculate overall status
    await this.recalculateOverallStatus(connection, ophId);
  }

  /**
   * Map step_status values to application_status format
   */
  mapStepStatusToApplicationStatus(stepStatus) {
    if (!stepStatus) return 'pending';
    
    const statusMap = {
      'pending': 'pending',
      'under review': 'under review',
      'approved': 'approved',
      'rejected': 'rejected'
    };

    return statusMap[stepStatus.toLowerCase()] || 'pending';
  }

  /**
   * Get application status (standalone - gets its own connection)
   */
  async getApplicationStatusStandalone(ophId) {
    const connection = await db.getConnection();
    
    try {
      return await this.getApplicationStatus(connection, ophId);
    } finally {
      connection.release();
    }
  }
}

module.exports = new ApplicationStatusService();

