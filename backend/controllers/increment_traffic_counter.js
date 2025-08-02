const {incrementTrafficCounter, getTrafficCounter} = require("../model/increment_traffic_counter")


const incrementTrafficCounterController = async (req, res) => {

    try
    {
        const {ophid, traffic_counter} = req.body

        if(!ophid || !traffic_counter)
        {
            return res.status(400).json({
                success: false,
                message: "Missing required field"
            })
        }

        const traffic = await getTrafficCounter(ophid)

        const updatedTrafficCounter = traffic[0].traffic + traffic_counter

        const response = await incrementTrafficCounter(ophid, updatedTrafficCounter)

        if(response)
        {
            return res.status(201).json({
                success: true,
                message: "Data updated successfully",
            })
        }
    }
    catch(err)
    {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }


}

module.exports = {incrementTrafficCounterController}