const contactUsModel = require("../model/contact_us");

const insertContactUs = async (req, res) => {
  const { name, email, phone, instagram_handle, description } = req.body;
  console.log(name, email, phone, instagram_handle, description);
  const result = await contactUsModel.insertContactUs(name, email, phone, instagram_handle, description);
  res.status(201).json({ message: "Contact us data inserted successfully", result });
};

const getContactUs = async (req, res) => {
  const result = await contactUsModel.getContactUs();
  res.status(200).json({ message: "Contact us data fetched successfully", result });
};

module.exports = { insertContactUs, getContactUs };