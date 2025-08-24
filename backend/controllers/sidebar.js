
const {getArtistType} = require("../model/sidebar")

const getArtistTypeController = async (req, res) => {

    try{
        const {ophid} = req.query

        if(!ophid)
        {
            return res.status({
                success: false,
                message : "Missing required fields"
            })
        }

        const response = await getArtistType(ophid)

        if(response)
        {
            return res.status(200).json({
                success: true,
                message: "Data fetched successfully",
                data: response
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

module.exports = {getArtistTypeController}