const paymentInfo = require("../model/payment");
const { setCurrentStep } = require("../model/common/set_step.js");

const payment = async (req, res) => {
  try {
    const { OPH_ID, Transaction_ID, Review, Status, step, from, song_id, event_id } = req.body;
    const ophid = OPH_ID;
    console.log(req.body);
    

    // Validate: only one of song_id or event_id should be present
    if (song_id && event_id) {
      return res.status(400).json({
        success: false,
        message: "Only one of song_id or event_id should be provided."
      });
    }

    // Call insertPayment with song_id or event_id (whichever is provided, null for the other)
    const dbResponse = await paymentInfo.insertPayment(
      OPH_ID,
      Transaction_ID,
      Review,
      Status,
      from,
      song_id || null,
      event_id || null
    );

    if (dbResponse) {
      if (from === "Registeration") {
        await setCurrentStep(step, ophid);
      }

      return res.status(200).json({
        success: true,
        message: "Payment ID sent for verification",
        step: step
      });
    }

    return res.status(500).json({
      success: false,
      message: "Payment - server Error"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Payment - server Error"
    });
  }
};

module.exports = { payment };
