import nodemailer from "nodemailer";

/**
 * Send an email
 * @param {Object} opts
 * @param {string} opts.to
 * @param {string} opts.subject
 * @param {string} opts.html
 */
const sendEmail = async ({ to, subject, html }) => {
  // Create transporter at call-time so .env is definitely loaded
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Sanity check
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ EMAIL_USER or EMAIL_PASS missing from .env");
    return { success: false, error: "Email credentials not configured" };
  }

  try {
    const info = await transporter.sendMail({
      from: `"MESH Clothing" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", info.messageId, "→", to);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    return { success: false, error: error.message };
  }
};

export default sendEmail;

// ─── OTP Templates ───

export const sendLoginOtp = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: "Your MESH Login OTP",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;">
        <h2 style="color:#111;">MESH Login Verification</h2>
        <p>Your one-time password (OTP) is:</p>
        <h1 style="font-size:36px;letter-spacing:6px;color:#111;background:#f5f5f5;padding:16px;text-align:center;border-radius:8px;">
          ${otp}
        </h1>
        <p style="color:#666;">Valid for 10 minutes.</p>
      </div>
    `,
  });
};

export const sendResetOtp = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: "MESH Password Reset OTP",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;">
        <h2 style="color:#111;">MESH Password Reset</h2>
        <p>Your OTP to reset your password is:</p>
        <h1 style="font-size:36px;letter-spacing:6px;color:#111;background:#f5f5f5;padding:16px;text-align:center;border-radius:8px;">
          ${otp}
        </h1>
        <p style="color:#666;">Valid for 10 minutes.</p>
      </div>
    `,
  });
};