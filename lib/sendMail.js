const nodemailer = require("nodemailer");


export const sendMail = async (receiver, subject, body) => {
  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = {
    from: `"Booth Bandhan Team" ${process.env.SMTP_USER}`, // sender address
    to: receiver, // list of recipients
    subject: subject, // subject line
    html: body, // HTML body
  };

  try {
    await transporter.sendMail(info)
    return { success: true, message: "Email sent successfully" };
  } catch (err) {
    return { success: false, message: "Failed to send email", error: err };
  }
}