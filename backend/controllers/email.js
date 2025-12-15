import axios from "axios";

export const sendEmail = async (email, subject, message) => {
  const response = await axios.post("http://localhost:5000/send-email", {
    to: email,
    subject,
    message,
  });

  return response.data;
};
