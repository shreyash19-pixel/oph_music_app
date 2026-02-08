const db = require('../../DB/connect');

/**
 * Event Bookings Model - Database operations for external user event registrations
 */

/**
 * Create a new event booking
 */
const createBooking = async (bookingData) => {
  const {
    event_id,
    first_name,
    last_name,
    email,
    phone,
    instagram_handle,
    profession_id,
    booking_reference,
    status = 'pending',
  } = bookingData;

  const [result] = await db.execute(
    `INSERT INTO event_bookings (
      event_id, first_name, last_name, email, phone, 
      instagram_handle, profession_id, booking_reference, status,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      event_id,
      first_name,
      last_name,
      email,
      phone,
      instagram_handle || null,
      profession_id || null,
      booking_reference,
      status,
    ]
  );

  return result.insertId;
};

/**
 * Get booking by booking reference
 */
const getBookingByReference = async (booking_reference) => {
  const [rows] = await db.execute(
    `SELECT * FROM event_bookings WHERE booking_reference = ?`,
    [booking_reference]
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Get booking by ID
 */
const getBookingById = async (id) => {
  const [rows] = await db.execute(
    `SELECT * FROM event_bookings WHERE id = ?`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Update booking status
 */
const updateBookingStatus = async (booking_reference, status) => {
  const [result] = await db.execute(
    `UPDATE event_bookings 
     SET status = ?, updated_at = NOW() 
     WHERE booking_reference = ?`,
    [status, booking_reference]
  );
  return result.affectedRows > 0;
};

/**
 * Update booking with payment transaction ID
 * Note: Status remains 'pending' after payment - only admin approval/rejection changes status
 */
const updateBookingPayment = async (booking_reference, transaction_id) => {
  const [result] = await db.execute(
    `UPDATE event_bookings 
     SET payment_transaction_id = ?, updated_at = NOW() 
     WHERE booking_reference = ?`,
    [transaction_id, booking_reference]
  );
  return result.affectedRows > 0;
};

/**
 * Update booking with OPH_ID (when user signs up later)
 */
const updateBookingOphId = async (booking_reference, oph_id) => {
  const [result] = await db.execute(
    `UPDATE event_bookings 
     SET oph_id = ?, updated_at = NOW() 
     WHERE booking_reference = ?`,
    [oph_id, booking_reference]
  );
  return result.affectedRows > 0;
};

/**
 * Check if email/phone already has a booking for this event
 */
const checkExistingBooking = async (event_id, email, phone) => {
  const [rows] = await db.execute(
    `SELECT * FROM event_bookings 
     WHERE event_id = ? 
     AND (email = ? OR phone = ?)
     AND status NOT IN ('rejected')
     LIMIT 1`,
    [event_id, email, phone]
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Get all bookings for an event
 */
const getBookingsByEventId = async (event_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM event_bookings 
     WHERE event_id = ? 
     ORDER BY created_at DESC`,
    [event_id]
  );
  return rows;
};

/**
 * Get all bookings with filters
 */
const getAllBookings = async (filters = {}) => {
  let query = `SELECT eb.*, e.EventName, e.dateTime as event_date_time
               FROM event_bookings eb
               LEFT JOIN events e ON eb.event_id = e.id
               WHERE 1=1`;
  const params = [];

  if (filters.event_id) {
    query += ` AND eb.event_id = ?`;
    params.push(filters.event_id);
  }

  if (filters.status) {
    query += ` AND eb.status = ?`;
    params.push(filters.status);
  }

  if (filters.email) {
    query += ` AND eb.email = ?`;
    params.push(filters.email);
  }

  if (filters.phone) {
    query += ` AND eb.phone = ?`;
    params.push(filters.phone);
  }

  query += ` ORDER BY eb.created_at DESC`;

  if (filters.limit) {
    query += ` LIMIT ?`;
    params.push(filters.limit);
  }

  const [rows] = await db.execute(query, params);
  return rows;
};

module.exports = {
  createBooking,
  getBookingByReference,
  getBookingById,
  updateBookingStatus,
  updateBookingPayment,
  updateBookingOphId,
  checkExistingBooking,
  getBookingsByEventId,
  getAllBookings,
};
