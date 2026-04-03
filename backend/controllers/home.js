const {newReleases, getArtistDetail, getReleatedArtists, getUpcomingSong} = require("../model/home")
const {getOphIdFromHash} = require("../model/artist_hash_mapping")


const newReleasesController = async (req, res) => {
    try {
        const response = await newReleases();
        
        // Always return a response, even if empty
        return res.status(200).json({
            success: true,
            message: "Data fetched successfully",
            data: response || {}
        });
    } catch (err) {
        console.error("Error in newReleasesController:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Internal server error"
        });
    }
}

const getArtistDetailController = async (req, res) => {

    try{
        const { id, token, artist } = req.query;
        const hashToken = token || artist;

        let ophId = id;

        // If hash token (token or artist query) is provided, lookup OPH_ID
        if (hashToken) {
            ophId = await getOphIdFromHash(hashToken);
            
            if(!ophId) {
                return res.status(404).json({
                    success: false,
                    message: "Invalid or expired artist link"
                })
            }
        }

        if(!ophId)
        {
            return res.status(400).json({
                success: false,
                message: "Missing required field (id, token, or artist)"
            })
        }

        const response = await getArtistDetail(ophId)

        if(response)
        {
            return res.status(200).json({
                success: true,
                message: "Data fetched successfully",
                data: response
            })
        }

        return res.status(404).json({
            success: false,
            message: "Artist details not found",
        })
    }
    catch(err)
    {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }

}

const getReleatedArtistsController = async (req, res) => {

    try{
        const {q} = req.query

        if(!q)
        {
            return res.status(400).json({
                success: false,
                message: "Missing required field"
            })
        }

        const response = await getReleatedArtists(q)

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


const getUpcomingSongController = async (req, res) => {
    try {
        const { ophid } = req.query;

        if (!ophid) {
            return res.status(400).json({
                success: false,
                message: "Missing required field"
            });
        }
        
        const response = await getUpcomingSong(ophid);

        // Always return a response, even if empty
        return res.status(200).json({
            success: true,
            message: "Data fetched successfully",
            data: response || {}
        });
    } catch (err) {
        console.error("Error in getUpcomingSongController:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Internal server error"
        });
    }
}


module.exports = {newReleasesController, getArtistDetailController, getReleatedArtistsController, getUpcomingSongController}
