export const verificationEmail = ({ link }) => {
  const brandColor = "#b45309";
  const actionUrl = link.verifyUrl || link.loginUrl;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Verify Your Email</title>
</head>
<body style="margin:0; padding:0; background-color:#f6f6f6; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f6f6f6; margin:0; padding:24px 0;">
    <tr>
      <td align="center" style="padding:0 16px;">
        <table role="presentation" width="420" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:420px; background-color:#ffffff; border:1px solid #e5e7eb;">
          <tr>
            <td align="center" bgcolor="${brandColor}" style="padding:20px; background-color:${brandColor}; color:#ffffff;">
              <h2 style="margin:0; font-size:24px; line-height:32px; font-weight:700;">Verify Your Email</h2>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px; color:#333333;">
              <h3 style="margin:0 0 12px; font-size:20px; line-height:28px; font-weight:700;">Hi ${link.name},</h3>
              <p style="margin:0 0 20px; font-size:15px; line-height:24px; color:#4b5563;">
                Thanks for signing up. Please confirm your email address to verify your account and continue securely.
              </p>
              <p style="margin:0 0 20px; font-size:14px; line-height:22px; color:#6b7280;">
                This verification link will expire in 48 hours.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 8px;">
                <tr>
                  <td align="center" bgcolor="${brandColor}" style="background-color:${brandColor};">
                    <a
                      href="${actionUrl}"
                      target="_blank"
                      style="display:inline-block; padding:12px 22px; font-size:14px; line-height:20px; font-weight:700; color:#ffffff; text-decoration:none;"
                    >
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0; font-size:13px; line-height:20px; color:#6b7280;">
                If the button does not work, copy and paste this link into your browser:
              </p>
              <p style="margin:8px 0 0; font-size:12px; line-height:18px; word-break:break-all; color:#92400e;">
                ${actionUrl}
              </p>
              <p style="margin:20px 0 0; font-size:12px; line-height:18px; color:#777777;">
                If you did not create this account, you can safely ignore this email.
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
