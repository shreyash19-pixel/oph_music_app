const eventWinnerModel = require('../model/eventWinner');

// Get all events with winner info
const getEventsWithWinnerInfo = async (req, res) => {
  try {
    const events = await eventWinnerModel.getEventsWithWinnerInfo();
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching events with winner info:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get accepted participants for an event
const getAcceptedParticipants = async (req, res) => {
  try {
    const { event_id } = req.params;
    const participants = await eventWinnerModel.getAcceptedParticipants(event_id);
    const event = await eventWinnerModel.getEventById(event_id);
    
    res.status(200).json({ 
      success: true, 
      data: { 
        event,
        participants 
      } 
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign winner to an event
// Prize amount is automatically taken from the event's winnerReward
const assignEventWinner = async (req, res) => {
  try {
    const { event_id, winner_oph_id } = req.body;
    
    if (!event_id || !winner_oph_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'event_id and winner_oph_id are required' 
      });
    }
    
    const result = await eventWinnerModel.assignEventWinner({
      event_id,
      winner_oph_id
    });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error assigning winner:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all artists for dropdown
const getAllArtistsForDropdown = async (req, res) => {
  try {
    const artists = await eventWinnerModel.getAllArtistsForDropdown();
    res.status(200).json({ success: true, data: artists });
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEventsWithWinnerInfo,
  getAcceptedParticipants,
  assignEventWinner,
  getAllArtistsForDropdown,
};
