const {getSpecialArtistDetails} = require("../model/my-epk")


const getSpecialArtistDetailsController = async (req, res) => {


    try{
        const {ophid} = req.query

        if(!ophid){
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            })
        }

        const response = await getSpecialArtistDetails(ophid)

        if(response)
        {
            return res.status(200).json({
                success:true,
                message: "Data Fetched Successfully",
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

module.exports = {getSpecialArtistDetailsController}