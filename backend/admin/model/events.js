const db = require('../../DB/connect');

const getAllEvents = async () => {
  const [rows] = await db.execute('SELECT * FROM OphData.events');
  return rows;
};

const insertEvent = async (eventData) => {
  const {
    event_id,
    EventName,
    dateTime,
    location,
    description,
    hashtags,
    registrationFee_normal,
    registrationFee_offer_availableFor,
    registrationFee_offer_discount,
    registrationStart,
    registrationEnd,
    winnerReward,
    image,
  } = eventData;

  const [result] = await db.execute(
    `INSERT INTO OphData.events (
      EventName,
      dateTime,
      location,
      description,
      hashtags,
      registrationFee_normal,
      registrationStart,
      registrationEnd,
      winnerReward,
      image
    ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      EventName,
      dateTime,
      location,
      description,
      hashtags,
      registrationFee_normal,
      registrationStart,
      registrationEnd,
      winnerReward,
      image,
    ]
  );

  return result;
};

module.exports = {
  getAllEvents,insertEvent
};
