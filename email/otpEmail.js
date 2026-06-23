export const otpEmail = ({ data }) => {
  const brandColor = "#b45309";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Your OTP Code</title>
</head>
<body style="margin:0; padding:0; background-color:#f6f6f6; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f6f6f6; margin:0; padding:24px 0;">
    <tr>
      <td align="center" style="padding:0 16px;">
        <table role="presentation" width="420" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:420px; background-color:#ffffff; border:1px solid #e5e7eb;">
          <tr>
            <td align="center" bgcolor="${brandColor}" style="padding:20px; background-color:${brandColor}; color:#ffffff;">
              <h2 style="margin:0; font-size:24px; line-height:32px; font-weight:700;">Password Reset OTP</h2>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px; color:#333333;">
              <h3 style="margin:0 0 12px; font-size:20px; line-height:28px; font-weight:700;">Hi ${data.name || "there"},</h3>
              <p style="margin:0 0 20px; font-size:15px; line-height:24px; color:#4b5563;">
                We received a request to reset your password. Use the OTP below to continue securely.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 12px;">
                <tr>
                  <td align="center" style="padding:14px 22px; border:1px solid #f3e8d7; background-color:#fff7ed;">
                    <p style="margin:0; font-size:30px; line-height:34px; letter-spacing:8px; font-weight:700; color:${brandColor};">
                      ${data.otp}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 20px; font-size:14px; line-height:22px; color:#6b7280;">
                This OTP will expire in 10 minutes.
              </p>
              <p style="margin:0; font-size:13px; line-height:20px; color:#6b7280;">
                If you did not request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return html;
};
