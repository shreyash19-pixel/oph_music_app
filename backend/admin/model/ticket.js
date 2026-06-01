const db = require("../../DB/connect");

const createTicket = async (
  ophID,
  name,
  email,
  subject,
  description,
  category,
  ticketNumber,
  imageURL
) => {
  const query = `
    INSERT INTO tickets
    (ophID, name, email, subject, description, category, ticketNumber, imageURL, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
  const [result] = await db.execute(query, [
    ophID,
    name,
    email,
    subject,
    description,
    category,
    ticketNumber,
    imageURL,
  ]);
  return result;
};

const getAllTickets = async (ophID) => {
  const [rows] = await db.execute("SELECT * FROM tickets WHERE ophID = ?", [
    ophID,
  ]);
  return rows;
};

const getTicketSummaries = async () => {
  const [rows] = await db.execute(
    `SELECT ophID, name, email, subject, description, category, imageURL, ticketNumber,
            status, notes, createdAt, updatedAt
     FROM tickets
     WHERE status != 'Resolved'`
  );
  return rows;
};

const updateResolvedSummary = async (ticketNumber, notes) => {
  await db.execute(
    `UPDATE tickets
     SET notes = ?, status = 'Resolved', updatedAt = NOW()
     WHERE ticketNumber = ?`,
    [notes, ticketNumber],
  );
  const [rows] = await db.execute(
    "SELECT * FROM tickets WHERE ticketNumber = ?",
    [ticketNumber],
  );
  return rows[0] ?? null;
};

const getTicket = async (ticketNumber) => {
  const [rows] = await db.execute(
    "SELECT * FROM tickets WHERE ticketNumber = ?",
    [ticketNumber]
  );
  return rows;
};

const getResolveSummaries = async () => {
  const [rows] = await db.execute(
    `SELECT ophID, name, email, subject, description, category, imageURL, ticketNumber,
            status, notes, createdAt, updatedAt
     FROM tickets
     WHERE status = 'Resolved'`
  );
  return rows;
};


module.exports = {
  createTicket,
  getAllTickets,
  getTicketSummaries,
  updateResolvedSummary,
  getTicket,
  getResolveSummaries,
};
