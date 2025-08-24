const db = require("../DB/connect");

const getAll = async () => {
    const [rows] = await db.execute('SELECT id, name, created_at FROM professions ORDER BY id');
    return rows;
  };
  
  const getById = async (id) => {
    const [rows] = await db.execute('SELECT id, name, created_at FROM professions WHERE id = ?', [id]);
    return rows[0];
  };
  
  const create = async (name) => {
    const [result] = await db.execute('INSERT INTO professions (name) VALUES (?)', [name]);
    // return inserted id and record
    return { id: result.insertId, name };
  };
  
  const remove = async (id) => {
    const [result] = await db.execute('DELETE FROM professions WHERE id = ?', [id]);
    return result.affectedRows; // 0 or 1
  };
  
  module.exports = {
    getAll,
    getById,
    create,
    remove
  };