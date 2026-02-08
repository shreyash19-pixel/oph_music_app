const db = require('../DB/connect');

/**
 * Generate a unique booking reference in format: EB-YYYY-XXXXXX
 * Example: EB-2026-001234
 */
async function generateBookingReference() {
  const year = new Date().getFullYear();
  const prefix = `EB-${year}-`;
  
  try {
    // Get the highest sequence number for this year
    const [rows] = await db.execute(
      `SELECT booking_reference 
       FROM event_bookings 
       WHERE booking_reference LIKE ?
       ORDER BY booking_reference DESC 
       LIMIT 1`,
      [`${prefix}%`]
    );
    
    let sequence = 1;
    
    if (rows.length > 0) {
      // Extract the sequence number from the last booking reference
      const lastRef = rows[0].booking_reference;
      const lastSequence = parseInt(lastRef.split('-')[2], 10);
      sequence = lastSequence + 1;
    }
    
    // Format sequence as 6-digit number with leading zeros
    const sequenceStr = sequence.toString().padStart(6, '0');
    return `${prefix}${sequenceStr}`;
  } catch (error) {
    // If table doesn't exist yet, start with 000001
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return `${prefix}000001`;
    }
    throw error;
  }
}

module.exports = {
  generateBookingReference,
};
