const db = require('../../DB/connect');

// Get all events with winner info
const getEventsWithWinnerInfo = async () => {
  try {
    // Try to get events with winner info (if event_winners table exists)
    const [rows] = await db.execute(`
      SELECT 
        e.id as event_id,
        e.EventName,
        e.dateTime,
        e.location,
        e.description,
        e.winnerReward,
        e.image,
        ew.winner_oph_id,
        ew.prize_amount,
        ew.created_at as winner_assigned_at,
        ud.stage_name as winner_name
      FROM events e
      LEFT JOIN event_winners ew ON e.id = ew.event_id
      LEFT JOIN user_details ud ON ew.winner_oph_id = ud.oph_id
      ORDER BY e.id DESC
    `);
    return rows;
  } catch (error) {
    // If event_winners table doesn't exist, just return events
    console.log('Note: event_winners table may not exist, returning events only');
    const [rows] = await db.execute(`
      SELECT 
        e.id as event_id,
        e.EventName,
        e.dateTime,
        e.location,
        e.description,
        e.winnerReward,
        e.image,
        NULL as winner_oph_id, 
        NULL as prize_amount, 
        NULL as winner_assigned_at, 
        NULL as winner_name
      FROM events e
      ORDER BY e.id DESC
    `);
    return rows;
  }
};

// Get participants for an event (accepted status only)
const getAcceptedParticipants = async (event_id) => {
  const [rows] = await db.execute(`
    SELECT 
      ep.*,
      ud.stage_name,
      ud.full_name,
      ud.personal_photo
    FROM event_participants ep
    LEFT JOIN user_details ud ON ep.oph_id = ud.oph_id
    WHERE ep.event_id = ? AND ep.status = 'accepted'
  `, [event_id]);
  return rows;
};

// Get event details
const getEventById = async (event_id) => {
  const [rows] = await db.execute(
    "SELECT id as event_id, EventName, dateTime, location, description, winnerReward, image FROM events WHERE id = ?",
    [event_id]
  );
  return rows[0];
};

// Assign winner - creates entry in event_winners and artist_income
// Prize amount is automatically taken from event's winnerReward
const assignEventWinner = async ({ event_id, winner_oph_id }) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get event details to fetch winnerReward
    const [eventRows] = await connection.execute(
      "SELECT EventName, winnerReward FROM events WHERE id = ?",
      [event_id]
    );
    
    if (eventRows.length === 0) {
      throw new Error('Event not found');
    }
    
    const event = eventRows[0];
    const prize_amount = parseFloat(event.winnerReward) || 0;
    const event_name = event.EventName;
    
    if (prize_amount <= 0) {
      throw new Error('Event does not have a valid winner reward amount');
    }
    
    // Check if winner already assigned for this event
    const [existing] = await connection.execute(
      "SELECT id FROM event_winners WHERE event_id = ?",
      [event_id]
    );
    
    if (existing.length > 0) {
      throw new Error('Winner already assigned for this event');
    }
    
    // Insert into event_winners table
    await connection.execute(
      `INSERT INTO event_winners (event_id, winner_oph_id, prize_amount, created_at)
       VALUES (?, ?, ?, NOW())`,
      [event_id, winner_oph_id, prize_amount]
    );
    
    // Insert into artist_income table
    await connection.execute(
      `INSERT INTO artist_income (oph_id, song_id, song_name, income_type, amount, description, created_at)
       VALUES (?, NULL, NULL, 'Events', ?, ?, NOW())`,
      [winner_oph_id, prize_amount, `Event Winner Prize - ${event_name}`]
    );
    
    await connection.commit();
    return { success: true, message: 'Winner assigned successfully', prize_amount };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Check if event has a winner
const hasWinner = async (event_id) => {
  const [rows] = await db.execute(
    "SELECT id FROM event_winners WHERE event_id = ?",
    [event_id]
  );
  return rows.length > 0;
};

// Get all artists for dropdown (completed application status)
const getAllArtistsForDropdown = async () => {
  const [rows] = await db.execute(`
    SELECT 
      ud.oph_id,
      ud.stage_name,
      ud.full_name
    FROM user_details ud
    WHERE ud.oph_id IN (
      SELECT oph_id FROM application_status WHERE overall_status = 'completed'
    )
    ORDER BY ud.stage_name ASC
  `);
  return rows;
};

module.exports = {
  getEventsWithWinnerInfo,
  getAcceptedParticipants,
  getEventById,
  assignEventWinner,
  hasWinner,
  getAllArtistsForDropdown,
};
