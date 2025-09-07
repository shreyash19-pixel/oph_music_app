const { getIncome } = require("../model/income");

const getIncomeController = async (req, res) => {
  try {
    const { ophid } = req.params;
    const income = await getIncome(ophid);
    res.status(200).json({ success: true, data: income });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getIncomeController };