const Prof = require('../model/professions');

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

const getProfessions = async (req, res) => {
  try {
    const rows = await Prof.getAll();
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getProfessions error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addProfession = async (req, res) => {
  try {
    const { name } = req.body;
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ success: false, message: 'Invalid profession name' });
    }

    const created = await Prof.create(name.trim());
    // Optionally fetch the row back to include created_at; for now return created id/name
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('addProfession error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteProfession = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const affected = await Prof.remove(id);
    if (affected === 0) {
      return res.status(404).json({ success: false, message: 'Profession not found' });
    }

    return res.json({ success: true, message: 'Profession deleted' });
  } catch (err) {
    console.error('deleteProfession error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProfessions,
  addProfession,
  deleteProfession
};