const songSocialMetricModel = require('../model/spotlight_notes');

// GET /social-metrics/:ophId
const getMetricsByOPH_ID = async (req, res) => {
  try {
    const { ophId } = req.params;
    const results = await songSocialMetricModel.getByOPH_ID(ophId);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// PUT /social-metrics/:id/notes
const updateNotes = async (req, res) => {
  try {
    const { ophid } = req.params;
    const { notes } = req.body;
    console.log(req.body);
    

    const result = await songSocialMetricModel.updateNotes(ophid, notes);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Entry not found' });
    } else {
      res.status(200).json({ message: 'Notes updated' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

module.exports = {
  getMetricsByOPH_ID,
  updateNotes,
};
