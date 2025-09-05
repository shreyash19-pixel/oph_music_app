const db = require("../../DB/connect");

const getCosting = async () => {
  const [rows] = await db.execute("SELECT * FROM costing");
  return rows;
};

const insertCosting = async (name,cost,qr_image_path) => {
  const [rows] = await db.execute("INSERT INTO costing (name,cost,qr_image_path) VALUES (?,?,?)", [name,cost,qr_image_path]);
  return rows;
};

const updateCosting = async (id, cost, qr_image_path) => {
  let query, params;
  
  if (qr_image_path) {
    // Update both cost and QR image
    query = "UPDATE costing SET cost = ?, qr_image_path = ? WHERE id = ?";
    params = [cost, qr_image_path, id];
  } else {
    // Update only cost, keep existing QR image
    query = "UPDATE costing SET cost = ? WHERE id = ?";
    params = [cost, id];
  }
  
  const [rows] = await db.execute(query, params);
  return rows;
};

const getCostingById = async (id) => {
  const [rows] = await db.execute("SELECT * FROM costing WHERE id = ?", [id]);
  return rows;
};

module.exports = { getCosting, insertCosting, updateCosting, getCostingById };