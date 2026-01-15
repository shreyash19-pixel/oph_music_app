const bookingModel = require("../model/date-booking");

exports.createBooking = async (req, res) => {
    try {
        const { oph_id, booking_date, song_name, project_type } = req.body;
        console.log(oph_id, booking_date, song_name, project_type, "calendar booking");

        if (!oph_id) {
            return res.status(400).json({ error: "oph_id is required" });
        }

        const response = await bookingModel.insertBooking(
            oph_id,
            booking_date,
            song_name,
            project_type
        );

        if (response) {
            return res.status(201).json({
                success: true,
                message: "Release date has been booked successfully",
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.insertSongAndProjectController = async (req, res) => {
    try {
        const { oph_id, song_name, project_type, release_date } = req.body;

        if (!oph_id || !song_name || !project_type || !release_date) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: oph_id, song_name, project_type, and release_date are required",
            });
        }

        const response = await bookingModel.insertSongAndProject(
            oph_id,
            song_name,
            project_type,
            release_date
        );

        if (response) {
            return res.status(201).json({
                success: true,
                message: "Data updated successfully",
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const { oph_id, old_booking_date, new_booking_date } = req.body;

        if (!oph_id) {
            return res.status(400).json({ error: "oph_id is required" });
        }

        const getExistingBookingDate = await bookingModel.findBookingByOphIdAndDate(
            oph_id,
            old_booking_date
        );

        if (getExistingBookingDate) {
            const updatedExistingBookingDate = await bookingModel.updateBooking(
                oph_id,
                old_booking_date,
                new_booking_date
            );

            if (updatedExistingBookingDate) {
                return res.status(201).json({
                    success: true,
                    message: "Date Updated successfully",
                });
            }
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await bookingModel.getAllBookings();

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Data fetched successfully",
            data: bookings || [],
        });
    } catch (error) {
        console.error("Error in getAllBookings:", error);
        res.status(500).json({ 
            status: 500,
            success: false,
            error: error.message || "Internal server error" 
        });
    }
};

exports.getAllBookingsByID = async (req, res) => {
    try {
        const { ophid } = req.query;

        const bookings = await bookingModel.getAllBookingsByID(ophid);

        if (bookings) {
            res.status(200).json({
                success: true,
                message: "Data fetched successfully",
                data: bookings,
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
