const {getLeaderBoardDetails} = require("../model/leaderboard")


const getLeaderboardDetailsController = async (req, res) => {

    try{
        const response = await getLeaderBoardDetails()

        if(response)
        {
            return res.status(200).json({
                success: true,
                message: "Data fetch successfully",
                data: response
            })
        }
    }
    catch(err)
    {
        return res.status(500).json({
            success: false,
            message : err.message
        })
    }

}


module.exports = {getLeaderboardDetailsController}