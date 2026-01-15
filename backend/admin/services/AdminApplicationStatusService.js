const db = require('../../DB/connect');
const ApplicationStatusService = require('../../services/application/ApplicationStatusService');

class AdminApplicationStatusService {
  /**
   * Update application step status from admin panel
   * Updates both the step table (user_details, professional_details, documentation_details) 
   * and the application_status table
   * 
   * @param {string} ophId - User's OPH ID
   * @param {string} step - Step name: 'personal_details'/'user', 'professional_details'/'professional', 'documentation_details'/'documentation'
   * @param {string} status - Status: 'approved' or 'rejected'
   * @param {string|null} rejectReason - Rejection reason if status is 'rejected'
   */
  async updateStepStatus(ophId, step, status, rejectReason = null) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Map step names to table names and status field names
      let stepTable, stepStatusField, applicationStatusField;
      
      switch (step.toLowerCase()) {
        case 'personal_details':
        case 'user':
        case 'personal':
          stepTable = 'user_details';
          stepStatusField = 'step_status';
          applicationStatusField = 'user_status';
          break;
        case 'professional_details':
        case 'professional':
          stepTable = 'professional_details';
          stepStatusField = 'step_status';
          applicationStatusField = 'professional_status';
          break;
        case 'documentation_details':
        case 'documentation':
          stepTable = 'documentation_details';
          stepStatusField = 'step_status';
          applicationStatusField = 'documentation_status';
          break;
        default:
          throw new Error(`Invalid step: ${step}`);
      }

      // Update the step table (user_details, professional_details, or documentation_details)
      if (stepTable === 'user_details') {
        await connection.execute(
          `UPDATE ${stepTable} 
           SET ${stepStatusField} = ?, reject_reason = ?, updated_at = NOW() 
           WHERE oph_id = ?`,
          [status, rejectReason, ophId]
        );
      } else {
        await connection.execute(
          `UPDATE ${stepTable} 
           SET ${stepStatusField} = ?, reject_reason = ?, updated_at = NOW() 
           WHERE oph_id = ?`,
          [status, rejectReason, ophId]
        );
      }

      // Update application_status table
      await ApplicationStatusService.updateStepStatus(
        connection,
        ophId,
        applicationStatusField === 'user_status' ? 'user' : step.toLowerCase(),
        status,
        rejectReason
      );

      // Recalculate overall_status
      await ApplicationStatusService.recalculateOverallStatus(connection, ophId);

      await connection.commit();

      return { success: true };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update multiple step statuses at once (for bulk updates from admin panel)
   * 
   * @param {string} ophId - User's OPH ID
   * @param {Object} updates - Object with step updates: { Personal: {...}, Professional: {...}, Documentation: {...} }
   */
  async updateMultipleStepStatuses(ophId, updates) {
    const connection = await db.getConnection();
    
    try {
      console.log("AdminApplicationStatusService - updateMultipleStepStatuses called");
      console.log("OPH ID:", ophId);
      console.log("Updates:", JSON.stringify(updates, null, 2));

      await connection.beginTransaction();

      const results = {};

      // Update Personal/User step
      if (updates.Personal) {
        console.log("Processing Personal update:", updates.Personal);
        console.log("Personal.status value:", updates.Personal.status, "Type:", typeof updates.Personal.status);
        
        // Map status: "Accepted" -> "approved", "Rejected" -> "rejected"
        let status;
        if (updates.Personal.status === "Accepted" || updates.Personal.status === "accepted") {
          status = "approved";
        } else if (updates.Personal.status === "Rejected" || updates.Personal.status === "rejected") {
          status = "rejected";
        } else {
          throw new Error(`Invalid Personal status: ${updates.Personal.status}`);
        }
        
        const reason = (updates.Personal.status === "Rejected" || updates.Personal.status === "rejected") 
          ? (updates.Personal.reason || null) 
          : null;
        
        console.log("Personal - Mapped status:", status, "Reason:", reason);
        
        // Update user_details table
        const [userUpdateResult] = await connection.execute(
          `UPDATE user_details 
           SET step_status = ?, reject_reason = ?, updated_at = NOW() 
           WHERE oph_id = ?`,
          [status, reason, ophId]
        );
        console.log("Personal - user_details update result:", userUpdateResult.affectedRows, "rows affected");
        console.log("Personal - user_details update info:", userUpdateResult.info);
        
        if (userUpdateResult.affectedRows === 0) {
          console.warn("Personal - No rows updated in user_details. OPH_ID might not exist:", ophId);
          // Check if user exists
          const [checkUser] = await connection.execute(
            `SELECT oph_id FROM user_details WHERE oph_id = ?`,
            [ophId]
          );
          console.log("Personal - User exists check:", checkUser.length > 0 ? "YES" : "NO");
          if (checkUser.length === 0) {
            throw new Error(`User with OPH_ID ${ophId} does not exist in user_details table`);
          }
        }

        // Update application_status table
        await ApplicationStatusService.updateStepStatus(
          connection,
          ophId,
          'user',
          status,
          reason
        );
        console.log("Personal - application_status updated");

        results.Personal = { success: true, status, reason, affectedRows: userUpdateResult.affectedRows };
      }

      // Update Professional step
      if (updates.Professional) {
        console.log("Processing Professional update:", updates.Professional);
        console.log("Professional.status value:", updates.Professional.status, "Type:", typeof updates.Professional.status);
        
        // Map status: "Accepted" -> "approved", "Rejected" -> "rejected"
        let status;
        if (updates.Professional.status === "Accepted" || updates.Professional.status === "accepted") {
          status = "approved";
        } else if (updates.Professional.status === "Rejected" || updates.Professional.status === "rejected") {
          status = "rejected";
        } else {
          throw new Error(`Invalid Professional status: ${updates.Professional.status}`);
        }
        
        const reason = (updates.Professional.status === "Rejected" || updates.Professional.status === "rejected")
          ? (updates.Professional.reason || null)
          : null;
        
        console.log("Professional - Mapped status:", status, "Reason:", reason);
        
        // Update professional_details table
        const [profUpdateResult] = await connection.execute(
          `UPDATE professional_details 
           SET step_status = ?, reject_reason = ?, updated_at = NOW() 
           WHERE oph_id = ?`,
          [status, reason, ophId]
        );
        console.log("Professional - professional_details update result:", profUpdateResult.affectedRows, "rows affected");
        console.log("Professional - professional_details update info:", profUpdateResult.info);
        
        if (profUpdateResult.affectedRows === 0) {
          console.warn("Professional - No rows updated in professional_details. OPH_ID might not exist:", ophId);
          // Check if professional_details exists
          const [checkProf] = await connection.execute(
            `SELECT oph_id FROM professional_details WHERE oph_id = ?`,
            [ophId]
          );
          console.log("Professional - Professional details exist check:", checkProf.length > 0 ? "YES" : "NO");
          if (checkProf.length === 0) {
            throw new Error(`Professional details for OPH_ID ${ophId} do not exist`);
          }
        }

        // Update application_status table
        await ApplicationStatusService.updateStepStatus(
          connection,
          ophId,
          'professional',
          status,
          reason
        );
        console.log("Professional - application_status updated");

        results.Professional = { success: true, status, reason, affectedRows: profUpdateResult.affectedRows };
      }

      // Update Documentation step
      if (updates.Documentation) {
        console.log("Processing Documentation update:", updates.Documentation);
        console.log("Documentation.status value:", updates.Documentation.status, "Type:", typeof updates.Documentation.status);
        
        // Map status: "Accepted" -> "approved", "Rejected" -> "rejected"
        let status;
        if (updates.Documentation.status === "Accepted" || updates.Documentation.status === "accepted") {
          status = "approved";
        } else if (updates.Documentation.status === "Rejected" || updates.Documentation.status === "rejected") {
          status = "rejected";
        } else {
          throw new Error(`Invalid Documentation status: ${updates.Documentation.status}`);
        }
        
        const reason = (updates.Documentation.status === "Rejected" || updates.Documentation.status === "rejected")
          ? (updates.Documentation.reason || null)
          : null;
        
        console.log("Documentation - Mapped status:", status, "Reason:", reason);
        
        // Update documentation_details table
        const [docUpdateResult] = await connection.execute(
          `UPDATE documentation_details 
           SET step_status = ?, reject_reason = ?, updated_at = NOW() 
           WHERE oph_id = ?`,
          [status, reason, ophId]
        );
        console.log("Documentation - documentation_details update result:", docUpdateResult.affectedRows, "rows affected");
        console.log("Documentation - documentation_details update info:", docUpdateResult.info);
        
        if (docUpdateResult.affectedRows === 0) {
          console.warn("Documentation - No rows updated in documentation_details. OPH_ID might not exist:", ophId);
          // Check if documentation_details exists
          const [checkDoc] = await connection.execute(
            `SELECT oph_id FROM documentation_details WHERE oph_id = ?`,
            [ophId]
          );
          console.log("Documentation - Documentation details exist check:", checkDoc.length > 0 ? "YES" : "NO");
          if (checkDoc.length === 0) {
            throw new Error(`Documentation details for OPH_ID ${ophId} do not exist`);
          }
        }

        // Update application_status table
        await ApplicationStatusService.updateStepStatus(
          connection,
          ophId,
          'documentation',
          status,
          reason
        );
        console.log("Documentation - application_status updated");

        results.Documentation = { success: true, status, reason, affectedRows: docUpdateResult.affectedRows };
      }

      // Recalculate overall_status after all updates
      await ApplicationStatusService.recalculateOverallStatus(connection, ophId);
      console.log("Overall status recalculated");

      await connection.commit();
      console.log("Transaction committed successfully");

      return { success: true, results };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new AdminApplicationStatusService();

