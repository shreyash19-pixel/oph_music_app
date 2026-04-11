const db = require("../../DB/connect");

const findUserByEmail = async (email) => {
  const [rows] = await db.execute("SELECT * FROM admin WHERE Email = ?", [email]);
  return rows;
};

/** Lightweight row for session validation (JWT av + role vs DB). */
const getAuthSessionByEmail = async (email) => {
  const [rows] = await db.execute(
    "SELECT Email, Role, auth_version FROM admin WHERE Email = ? LIMIT 1",
    [email]
  );
  return rows;
};

const updateRoleByEmail = async (email, newRole) => {
  const [result] = await db.execute(
    `UPDATE admin
     SET Role = ?,
         auth_version = COALESCE(auth_version, 1) + 1
     WHERE Email = ?`,
    [newRole, email]
  );
  return result;
};

/** Name, phone, etc. for the signed-in admin (admin panel JWT). */
const getProfileByEmail = async (email) => {
  const [rows] = await db.execute(
    `SELECT Name, Email, ContactNumber, Role
     FROM admin
     WHERE Email = ?
     LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
};

module.exports = {
  findUserByEmail,
  getAuthSessionByEmail,
  updateRoleByEmail,
  getProfileByEmail,
};
