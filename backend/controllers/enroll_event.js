const event_enrollment = require("../model/enroll_event.js");


const insertEventEnrollments = async (req, res) => {
    try {
        const {
            ophid,
            event_id
        } = req.body;

        if (
            !ophid ||
            !event_id
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const response = await event_enrollment.enrollEvents(ophid, event_id)

        if(response)
        {
            return res.status(201).json({
                success: true,
                message: "Event booked successfully"
            })
        }

    } catch (err) {
        console.error("Error updating personal details:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getEnrolledEvents = async (req, res) => {
    try {
        const bookings = await event_enrollment.getAllEvents()
        
        if(bookings)
        {
            return res.status(200).json({
                success : true,
                message: "Data fetched successfully",
                data: bookings
            })
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { insertEventEnrollments, getEnrolledEvents };
