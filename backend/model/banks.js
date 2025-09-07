const db = require('../DB/connect');

const getBanks = async () => {
  const [rows] = await db.execute('SELECT * FROM banks');
  return rows;
};

const addBank = async (name) => {
  const [result] = await db.execute('INSERT INTO banks (name) VALUES (?)', [name]);
  return result;
};

const deleteBank = async (bank_id) => {
  const [result] = await db.execute('DELETE FROM banks WHERE id = ?', [bank_id]);
  return result;
};

module.exports = { getBanks, addBank, deleteBank };