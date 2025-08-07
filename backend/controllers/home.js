const {newReleases, getArtistDetail, getReleatedArtists} = require("../model/home")


const newReleasesController = async (req, res) => {

    try{
        const response = await newReleases()

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

const getArtistDetailController = async (req, res) => {

    try{
        const {id} = req.query

        console.log(id);
        

        if(!id)
        {
            return res.status(400).json({
                success: false,
                message: "Missing required field"
            })
        }

        const response = await getArtistDetail(id)

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


module.exports = {newReleasesController, getArtistDetailController, getReleatedArtistsController}
