const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, otp) => {
  /*
   * RTL / translation flip fix:
   * - dir="ltr" + unicode-bidi:embed on every wrapper around the OTP
   * - Prevents Gmail auto-translate from reversing digits in Arabic/Hebrew locales
   */

  const html = `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Your verification code</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;-webkit-font-smoothing:antialiased;">

  <!--
    PREHEADER TRICK:
    This text is the FIRST thing shown in iOS/Android notification shade
    and Gmail inbox snippet — without opening the email.
    The &#847; chars are zero-width non-joiners that pad the preheader so Gmail
    doesn't pull random body text into the notification.
  -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:transparent;">
    Your sign-in code: ${otp} — valid for 5 minutes. Do not share this code.&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:#f4f4f5;padding:48px 16px;min-width:320px;">
    <tr>
      <td align="center" valign="top">

        <table width="480" cellpadding="0" cellspacing="0" border="0"
          style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;
                 border:1px solid #e4e4e7;overflow:hidden;">

          <!-- Top accent line -->
          <tr>
            <td style="height:3px;background:#f28602;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Brand header -->
          <tr>
            <td style="padding:28px 36px 24px;border-bottom:1px solid #f4f4f5;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="
                          background:#fff7ed;
                          border:1px solid #fdba74;
                          border-radius:6px;
                          padding:5px 12px;
                        ">
                          <span style="
                            font-size:12px;font-weight:700;color:#f28602;
                            letter-spacing:0.08em;text-transform:uppercase;
                            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
                          ">HireFlow</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="
                          background:#fef3c7;
                          border:1px solid #fcd34d;
                          border-radius:99px;
                          padding:4px 10px;
                        ">
                          <span style="
                            font-size:11px;font-weight:600;color:#92400e;
                            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
                          ">&#9203; 5 min</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:32px 36px 28px;">

              <p style="
                margin:0 0 6px;font-size:22px;font-weight:700;color:#09090b;line-height:1.25;
                font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
              ">Verify your identity</p>

              <p style="
                margin:0 0 28px;font-size:14px;color:#71717a;line-height:1.6;
                font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
              ">
                Enter this code to complete your sign-in. Never share it with anyone.
              </p>

              <!--
                OTP BLOCK — triple dir="ltr" + unicode-bidi:embed
                Prevents RTL / Arabic translation from reversing the digit order.
              -->
              <div dir="ltr" style="direction:ltr;unicode-bidi:embed;">
                <table dir="ltr" cellpadding="0" cellspacing="0" border="0" width="100%"
                  style="direction:ltr;unicode-bidi:embed;">
                  <tr dir="ltr">
                    <td dir="ltr" style="
                      direction:ltr;unicode-bidi:embed;
                      background:#fafafa;
                      border:2px solid #f28602;
                      border-radius:12px;
                      padding:24px;
                      text-align:center;
                    ">
                      <p style="
                        margin:0 0 10px;
                        font-size:10px;font-weight:600;color:#a1a1aa;
                        letter-spacing:0.12em;text-transform:uppercase;
                        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
                      ">Your sign-in code</p>

                      <span dir="ltr" style="
                        direction:ltr;unicode-bidi:embed;
                        display:block;
                        font-size:46px;
                        font-weight:800;
                        color:#09090b;
                        letter-spacing:0.2em;
                        font-family:'SF Mono','Fira Code','Fira Mono','Roboto Mono',
                                    'Courier New',Courier,monospace;
                        line-height:1;
                        padding-left:0.2em;
                      ">${otp}</span>

                      <div style="margin-top:18px;height:3px;background:#e4e4e7;border-radius:99px;">
                        <div style="width:100%;height:3px;background:#f28602;border-radius:99px;"></div>
                      </div>
                      <p style="
                        margin:8px 0 0;font-size:11px;color:#a1a1aa;
                        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
                      ">Expires in 5 minutes</p>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Security notice -->
          <tr>
            <td style="padding:0 36px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background:#fafafa;
                border:1px solid #e4e4e7;
                border-left:3px solid #f28602;
                border-radius:0 8px 8px 0;
              ">
                <tr>
                  <td style="padding:12px 16px;">
                    <p style="
                      margin:0 0 2px;font-size:12px;font-weight:600;color:#09090b;
                      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
                    ">Didn't request this?</p>
                    <p style="
                      margin:0;font-size:12px;color:#71717a;line-height:1.55;
                      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
                    ">
                      Ignore this email — the code expires automatically.
                      If this keeps happening, please secure your account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding:16px 36px;
              background:#fafafa;
              border-top:1px solid #f4f4f5;
              border-radius:0 0 16px 16px;
            ">
              <p style="
                margin:0;font-size:11px;color:#a1a1aa;
                font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
              ">
                &copy; ${new Date().getFullYear()} HireFlow &middot; Automated security message
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

  await transporter.sendMail({
    from: `"HireFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;