const db = require("../DB/connect")


/** Add delta to traffic (atomic; NULL traffic treated as 0). */
const incrementTrafficCounter = async (ophid, delta) => {
  const [rows] = await db.execute(
    "UPDATE user_details SET traffic = COALESCE(traffic, 0) + ? WHERE oph_id = ?",
    [delta, ophid],
  );
  return rows;
};

const getTrafficCounter = async (ophid) => {

    const [rows] = await db.execute("SELECT traffic FROM user_details WHERE oph_id = ?", [ophid])

    return rows

}

module.exports = {incrementTrafficCounter, getTrafficCounter}