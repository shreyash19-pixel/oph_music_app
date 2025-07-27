
const {getArtistInfo, getSongRankings} = require("../model/artist-spotlight")


const getArtistInfoController = async (req, res) => {

    try{    

        const {ophid} = req.query

        if(!ophid)
        {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            })
        }

        const response = await getArtistInfo(ophid)

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

const getSongRankingsController = async (req, res) => {

    try{
        const response = await getSongRankings()
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


module.exports = {getArtistInfoController, getSongRankingsController}