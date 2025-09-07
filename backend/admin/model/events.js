const db = require("../../DB/connect");

const getAllEvents = async () => {
  const [rows] = await db.query("SELECT * FROM events ORDER BY dateTime DESC");
  return rows;
};

const insertEvent = async (eventData) => {
  const {
    EventName,
    dateTime,
    location,
    description,
    long_desc,
    hashtags,
    registrationFee_normal,
    registrationFee_offer_availableFor,
    registrationFee_offer_discount,
    registrationStart,
    registrationEnd,
    winnerReward,
    image,
    payment_qr,
    payment_qr_discount,
  } = eventData;

  const [result] = await db.execute(
    `INSERT INTO OphData.events (
      EventName,
      dateTime,
      location,
      description,
      long_desc,
      hashtags,
      registrationFee_normal,
      registrationStart,
      registrationEnd,
      winnerReward,
      image,
      payment_qr,
      payment_qr_discount
    ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      EventName,
      dateTime,
      location,
      description,
      long_desc,
      hashtags,
      registrationFee_normal,
      registrationStart,
      registrationEnd,
      winnerReward,
      image,
      payment_qr,
      payment_qr_discount,
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
      payment_qr,
      payment_qr_discount,
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

const getEventById = async (eventId) => {
  const sql = `SELECT
                 event_id,
                 EventName,
                 dateTime,
                 location,
                 description,
                 long_desc,
                 hashtags,
                 registrationFee_normal,
                 registrationFee_offer_availableFor,
                 registrationFee_offer_discount,
                 registrationStart,
                 registrationEnd,
                 winnerReward,
                 image,
                 payment_qr,
                 payment_qr_discount
               FROM events
               WHERE event_id = ?
               LIMIT 1`;

  const [rows] = await db.query(sql, [eventId]);
  return rows.length ? rows[0] : null;
};

const updateEvent = async (eventId, eventData) => {
  const {
    EventName,
    dateTime,
    location,
    description,
    long_desc,
    hashtags,
    registrationFee_normal,
    registrationStart,
    registrationEnd,
    winnerReward,
    image,
    payment_qr,
    payment_qr_discount,
  } = eventData;

  const [result] = await db.execute(
    `UPDATE OphData.events SET
      EventName = ?,
      dateTime = ?,
      location = ?,
      description = ?,
      long_desc = ?,
      hashtags = ?,
      registrationFee_normal = ?,
      registrationStart = ?,
      registrationEnd = ?,
      winnerReward = ?,
      image = ?,
      payment_qr = ?,
      payment_qr_discount = ?
    WHERE event_id = ?`,
    [
      EventName,
      dateTime,
      location,
      description,
      long_desc,
      hashtags,
      registrationFee_normal,
      registrationStart,
      registrationEnd,
      winnerReward,
      image,
      payment_qr,
      payment_qr_discount,
      eventId,
    ],
  );

  return result;
};

module.exports = {
  getAllEvents,
  insertEvent,
  getAllEventsWithStatus,
  getEventById,
  updateEvent,
};
