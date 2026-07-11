export const cashPaymentConfirmationEmail = ({
  candidateName,
  candidateEmail,
  leaderName,
  leaderEmail,
  leaderPhone,
  amount,
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cash Payment Confirmed</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc; padding:24px 0;">
    <tr>
      <td align="center" style="padding:0 16px;">
        <table role="presentation" width="460" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:460px; background-color:#ffffff; border:1px solid #e5e7eb;">
          <tr>
            <td style="background-color:#166534; padding:20px; color:#ffffff; text-align:center;">
              <h2 style="margin:0; font-size:24px; line-height:32px;">Cash Payment Recorded</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:24px; color:#334155;">
              <p style="margin:0 0 16px; font-size:15px; line-height:24px;">
                The leader registration payment has been marked as received in cash.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0; font-size:14px; font-weight:700; color:#0f172a;">Leader</td>
                  <td style="padding:8px 0; font-size:14px; color:#475569;">${leaderName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:14px; font-weight:700; color:#0f172a;">Leader Email</td>
                  <td style="padding:8px 0; font-size:14px; color:#475569;">${leaderEmail}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:14px; font-weight:700; color:#0f172a;">Leader Phone</td>
                  <td style="padding:8px 0; font-size:14px; color:#475569;">${leaderPhone}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:14px; font-weight:700; color:#0f172a;">Candidate</td>
                  <td style="padding:8px 0; font-size:14px; color:#475569;">${candidateName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:14px; font-weight:700; color:#0f172a;">Candidate Email</td>
                  <td style="padding:8px 0; font-size:14px; color:#475569;">${candidateEmail}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:14px; font-weight:700; color:#0f172a;">Amount</td>
                  <td style="padding:8px 0; font-size:14px; color:#475569;">Rs. ${amount}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:14px; font-weight:700; color:#0f172a;">Status</td>
                  <td style="padding:8px 0; font-size:14px; color:#166534;">Paid</td>
                </tr>
              </table>
              <p style="margin:20px 0 0; font-size:13px; line-height:20px; color:#64748b;">
                This confirmation was generated automatically from Booth Bandhan.
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
