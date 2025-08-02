const {newReleases} = require("../model/home")


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


module.exports = {newReleasesController}
