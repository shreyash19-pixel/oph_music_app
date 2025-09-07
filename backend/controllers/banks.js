const Banks = require('../model/banks');

const getBanks = async (req, res) => {
  const banks = await Banks.getBanks();
  res.status(200).json({ success: true, data: banks });
};

const addBank = async (req, res) => {
  const { name } = req.body;
  const bank = await Banks.addBank(name);
  res.status(201).json({ success: true, data: bank });
};

const deleteBank = async (req, res) => {
  const { bank_id } = req.params;
  const bank = await Banks.deleteBank(bank_id);
  res.status(200).json({ success: true, data: bank });
};

module.exports = { getBanks, addBank, deleteBank };