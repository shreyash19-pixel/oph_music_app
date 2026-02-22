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

/**
 * Get costs by name for payment logic (Song Registration, Lyrics Service, etc.)
 * Returns { songRegistration, lyricsService, lyricalVideo } from costing table.
 */
const getCostsForPaymentLogic = async () => {
  const [rows] = await db.execute("SELECT name, cost FROM costing");
  const map = {};
  for (const r of rows || []) {
    const key = String(r.name || '').toLowerCase().trim();
    const cost = parseFloat(r.cost);
    if (!isNaN(cost)) map[key] = cost;
  }
  const byContains = (sub) => {
    const k = Object.keys(map).find(x => x.includes(sub));
    return k ? map[k] : null;
  };
  return {
    songRegistration: byContains('song registration') ?? 799,
    lyricsService: byContains('lyrics service') ?? 399,
    lyricalVideo: byContains('lyrical video') ?? 1198,
  };
};

module.exports = { getCosting, insertCosting, updateCosting, getCostingById, getCostsForPaymentLogic };