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

module.exports = {
  findUserByEmail,
  getAuthSessionByEmail,
  updateRoleByEmail,
};
