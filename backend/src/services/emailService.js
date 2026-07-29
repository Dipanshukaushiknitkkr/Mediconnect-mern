const nodemailer = require('nodemailer');

const sendOtpEmail = async (toEmail, otpCode, name) => {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  if (!user || !pass) {
    console.log(`[Email Service Notice] SMTP credentials not configured. OTP for ${toEmail}: ${otpCode}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: { user, pass }
    });

    const mailOptions = {
      from: `"MediConnect Telehealth" <${user}>`,
      to: toEmail,
      subject: '🔒 Your 6-Digit Email Verification Code - MediConnect',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #ffffff; rounded: 12px;">
          <h2 style="color: #a855f7;">Welcome to MediConnect, ${name}!</h2>
          <p style="font-size: 14px; color: #cbd5e1;">Please use the following 6-digit OTP code to verify and activate your account:</p>
          <div style="background-color: #1e293b; padding: 15px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #38bdf8;">${otpCode}</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Verification email sent successfully to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${toEmail}:`, error.message);
    return false;
  }
};

module.exports = { sendOtpEmail };
