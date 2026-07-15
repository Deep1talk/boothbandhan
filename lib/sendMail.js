const nodemailer = require("nodemailer");

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required mail configuration: ${name}`);
  }

  return value;
}

function resolveMailConfig() {
  const host = getRequiredEnv("SMTP_HOST");
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASS");
  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    process.env.SMTP_SECURE === "true" ||
    process.env.SMTP_SECURE === "1" ||
    port === 465;

  return {
    host,
    port,
    secure,
    user,
    pass,
  };
}

export const sendMail = async (receiver, subject, body) => {
  try {
    const config = resolveMailConfig();
    const normalizedReceiver = typeof receiver === "string" ? receiver.trim() : "";

    if (!normalizedReceiver) {
      return {
        success: false,
        message: "Recipient email address is missing",
        error: new Error("Recipient email address is missing"),
      };
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const info = {
      from: `"Booth Bandhan Team" <${config.user}>`,
      to: normalizedReceiver,
      subject,
      html: body,
    };

    await transporter.sendMail(info);
    return { success: true, message: "Email sent successfully" };
  } catch (err) {
    console.error("Email send failed", {
      message: err?.message || "Unknown mail error",
      code: err?.code || null,
      command: err?.command || null,
      response: err?.response || null,
    });

    return { success: false, message: "Failed to send email", error: err };
  }
};
