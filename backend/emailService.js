import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    const result = await resend.emails.send({
      from: "OPH Community <creators@ophcommunity.org>", // or verified domain
      to,
      subject,
      html,
    });

    return result;
  } catch (err) {
    console.error("Email Error:", err);
    throw err;
  }
};
