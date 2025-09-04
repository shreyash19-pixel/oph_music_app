const db = require("../DB/connect");

const insertContactUs = async (name, email, phone, instagram_handle, description) => {
  const [result] = await db.execute("INSERT INTO contact_us (name, email, phone, instagram_handle, description) VALUES (?, ?, ?, ?, ?)", [name, email, phone, instagram_handle, description]);
  return result;
};

const getContactUs = async () => {
  const [result] = await db.execute("SELECT * FROM contact_us");
  return result;
};

module.exports = { insertContactUs, getContactUs };