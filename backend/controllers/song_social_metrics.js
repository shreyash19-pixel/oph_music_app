const {songSocialMetric, getTrafficCounter} = require("../model/song_social_metrics")


const songSocialMetricController = async (req, res) => {

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

        const updatedTrafficCounter = traffic[0].traffic

        const response = await songSocialMetric(ophid, updatedTrafficCounter)

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

module.exports = {songSocialMetricController}