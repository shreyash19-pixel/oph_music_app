const EventBookingService = require('../services/EventBookingService');

/**
 * Create a new event booking (Public - No Auth Required)
 * POST /events/bookings/:event_id
 */
const createBooking = async (req, res) => {
  try {
    const { event_id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      instagram_handle,
      profession_id,
    } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'first_name, last_name, email, and phone are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate phone (10 digits for India)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits',
      });
    }

    // Validate Instagram handle format (optional) - allows query params from share links (e.g. ?igsh=...)
    if (instagram_handle) {
      const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?(?:\?[^#\s]*)?$/;
      if (!instagramRegex.test(instagram_handle)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Instagram URL format',
        });
      }
    }

    const result = await EventBookingService.createBooking({
      event_id: parseInt(event_id, 10),
      first_name,
      last_name,
      email,
      phone,
      instagram_handle,
      profession_id: profession_id ? parseInt(profession_id, 10) : null,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create booking',
    });
  }
};

/**
 * Get booking by reference (Public - No Auth Required)
 * GET /events/bookings/:booking_reference
 */
const getBookingByReference = async (req, res) => {
  try {
    const { booking_reference } = req.params;

    if (!booking_reference) {
      return res.status(400).json({
        success: false,
        message: 'booking_reference is required',
      });
    }

    const result = await EventBookingService.getBookingByReference(booking_reference);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Booking not found',
    });
  }
};

/**
 * Update booking with payment (Internal - Used by payment callback)
 * PUT /events/bookings/:booking_reference/payment
 * Note: Status remains 'pending' - only admin approval/rejection changes status
 */
const updateBookingPayment = async (req, res) => {
  try {
    const { booking_reference } = req.params;
    const { transaction_id } = req.body;

    if (!booking_reference || !transaction_id) {
      return res.status(400).json({
        success: false,
        message: 'booking_reference and transaction_id are required',
      });
    }

    const result = await EventBookingService.updateBookingWithPayment(
      booking_reference,
      transaction_id
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating booking payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update booking payment',
    });
  }
};

/**
 * Update booking status (Admin only - for approval/rejection)
 * PUT /events/bookings/:booking_reference/status
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { booking_reference } = req.params;
    const { status } = req.body;

    if (!booking_reference || !status) {
      return res.status(400).json({
        success: false,
        message: 'booking_reference and status are required',
      });
    }

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const result = await EventBookingService.updateBookingStatus(booking_reference, status);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update booking status',
    });
  }
};

/**
 * Get all bookings (Admin only)
 * GET /events/bookings
 */
const getAllBookings = async (req, res) => {
  try {
    const { event_id, status, email, phone, limit } = req.query;

    const filters = {};
    if (event_id) filters.event_id = parseInt(event_id, 10);
    if (status) filters.status = status;
    if (email) filters.email = email;
    if (phone) filters.phone = phone;
    if (limit) filters.limit = parseInt(limit, 10);

    const result = await EventBookingService.getAllBookings(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch bookings',
    });
  }
};

module.exports = {
  createBooking,
  getBookingByReference,
  updateBookingPayment,
  updateBookingStatus,
  getAllBookings,
};
