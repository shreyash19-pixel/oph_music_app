const db = require('../../DB/connect');
const EventBookingModel = require('../model/eventBookings');
const EventModel = require('../model/events');
const EventParticipantModel = require('../model/eventParticipant');
const { generateBookingReference } = require('../../utils/bookingReference');
const { getEndOfDayIST } = require('../../utils/registrationWindow');

class EventBookingService {
  /**
   * Create a new event booking for external user
   */
  async createBooking(bookingData) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const {
        event_id,
        first_name,
        last_name,
        email,
        phone,
        instagram_handle,
        profession_id,
      } = bookingData;

      // Validate event exists
      const event = await EventModel.getEventById(event_id);
      if (!event) {
        throw new Error('Event not found');
      }

      // Check if registration is open
      const now = new Date();
      const regStart = event.registrationStart ? new Date(event.registrationStart) : null;
      const regEnd = event.registrationEnd ? getEndOfDayIST(event.registrationEnd) : null;

      if (regStart && now < regStart) {
        throw new Error('Registration has not started yet');
      }

      if (regEnd && now > regEnd) {
        throw new Error('Registration has closed');
      }

      // Check for existing booking (prevent duplicates)
      const existingBooking = await EventBookingModel.checkExistingBooking(
        event_id,
        email,
        phone
      );

      if (existingBooking) {
        // If existing booking is pending, return it
        if (existingBooking.status === 'pending') {
          return {
            success: true,
            data: {
              id: existingBooking.id,
              booking_reference: existingBooking.booking_reference,
              event_id: existingBooking.event_id,
              status: existingBooking.status,
              amount: event.registrationFee_normal,
              message: 'Booking already exists',
            },
          };
        }
        // If approved, user already registered
        if (existingBooking.status === 'approved') {
          throw new Error('You have already registered for this event');
        }
        // If rejected, allow re-registration
      }

      // Generate unique booking reference
      const booking_reference = await generateBookingReference();

      // Create booking record
      const bookingId = await EventBookingModel.createBooking({
        event_id,
        first_name,
        last_name,
        email,
        phone,
        instagram_handle,
        profession_id,
        booking_reference,
        status: 'pending',
      });

      await connection.commit();

      return {
        success: true,
        data: {
          id: bookingId,
          booking_reference,
          event_id,
          status: 'pending',
          amount: event.registrationFee_normal,
          event_name: event.EventName,
        },
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get booking by reference
   */
  async getBookingByReference(booking_reference) {
    const booking = await EventBookingModel.getBookingByReference(booking_reference);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    const event = await EventModel.getEventById(booking.event_id);
    
    return {
      success: true,
      data: {
        ...booking,
        event_name: event ? event.EventName : null,
        event_date: event ? event.dateTime : null,
      },
    };
  }

  /**
   * Update booking with payment information
   * Note: Status remains 'pending' - only admin approval/rejection changes status
   */
  async updateBookingWithPayment(booking_reference, transaction_id) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get booking details
      const booking = await EventBookingModel.getBookingByReference(booking_reference);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Update booking with payment info (status stays 'pending')
      await EventBookingModel.updateBookingPayment(booking_reference, transaction_id);

      // Note: External users use event_bookings table only
      // Internal users use event_participants table (handled in PaymentService)

      await connection.commit();

      return {
        success: true,
        message: 'Booking updated with payment information',
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update booking status (for admin actions)
   */
  async updateBookingStatus(booking_reference, status) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const booking = await EventBookingModel.getBookingByReference(booking_reference);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Update booking status
      await EventBookingModel.updateBookingStatus(booking_reference, status);

      // Note: External users use event_bookings table only
      // Internal users use event_participants table (handled in AdminPaymentService)

      await connection.commit();

      return {
        success: true,
        message: 'Booking status updated',
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Link booking to OPH_ID when user signs up
   */
  async linkBookingToOphId(booking_reference, oph_id) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const booking = await EventBookingModel.getBookingByReference(booking_reference);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Update booking with OPH_ID
      await EventBookingModel.updateBookingOphId(booking_reference, oph_id);

      // Update event_participants to use real OPH_ID instead of booking_reference
      await connection.execute(
        `UPDATE event_participants 
         SET oph_id = ? 
         WHERE oph_id = ? AND event_id = ?`,
        [oph_id, booking_reference, booking.event_id]
      );

      await connection.commit();

      return {
        success: true,
        message: 'Booking linked to OPH_ID',
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all bookings with filters (for admin)
   */
  async getAllBookings(filters = {}) {
    const bookings = await EventBookingModel.getAllBookings(filters);
    return {
      success: true,
      data: bookings,
    };
  }
}

module.exports = new EventBookingService();
