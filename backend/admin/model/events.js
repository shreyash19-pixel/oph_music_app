const db = require("../../DB/connect");

const getAllEvents = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM OphData.events ORDER BY dateTime",
  );
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
    ],
  );

  return result;
};

const getAllEventsWithStatus = async () => {
  const [rows] = await db.execute(
    `SELECT
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
      CASE
        WHEN dateTime >= NOW() THEN 'upcoming'
        ELSE 'previous'
      END AS event_type
    FROM events
    ORDER BY
      (CASE WHEN dateTime >= NOW() THEN 0 ELSE 1 END),
      CASE WHEN dateTime >= NOW() THEN dateTime END ASC,
      CASE WHEN dateTime <  NOW() THEN dateTime END DESC;`,
  );

  return rows;
};

module.exports = {
  getAllEvents,
  insertEvent,
  getAllEventsWithStatus,
};
