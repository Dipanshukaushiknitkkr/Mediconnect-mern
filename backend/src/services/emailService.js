const nodemailer = require('nodemailer');

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp-pulse.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  if (!user || !pass) return null;

  // Supports Resend, SendPulse, or custom SMTP host
  if (process.env.SMTP_HOST || host.includes('resend') || host.includes('pulse')) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: { user, pass }
  });
};

const getSenderEmail = () => {
  if (process.env.SMTP_SENDER) return process.env.SMTP_SENDER;
  if (process.env.SMTP_HOST?.includes('resend')) return '"MediConnect Telehealth" <onboarding@resend.dev>';
  return `"MediConnect Telehealth" <${process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@mediconnect.com'}>`;
};

const sendPasswordResetEmail = async (toEmail, resetToken, name) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.CLIENT_URL || 'https://mediconnect-telehealth.onrender.com'}/reset-password?token=${resetToken}`;

  if (!transporter) {
    console.log(`[Email Service Notice] SMTP not configured. Reset Link for ${toEmail}: ${resetUrl}`);
    return false;
  }

  try {
    const mailOptions = {
      from: getSenderEmail(),
      to: toEmail,
      subject: '🔑 Password Reset Request - MediConnect',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #0f172a; color: #ffffff; border-radius: 16px;">
          <h2 style="color: #38bdf8;">Password Reset Request</h2>
          <p style="font-size: 14px; color: #cbd5e1;">Hello ${name || 'User'},</p>
          <p style="font-size: 14px; color: #cbd5e1;">We received a request to reset the password for your MediConnect account.</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 12px; display: inline-block;">
              Reset Password Now
            </a>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">This reset link is valid for 1 hour. If you did not request a password reset, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Password reset email sent via SMTP to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${toEmail}:`, error.message);
    return false;
  }
};

const sendAppointmentConfirmationEmail = async (toEmail, appointmentData) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[Email Service Notice] SMTP not configured. Appointment booked for ${toEmail}`);
    return false;
  }

  try {
    const mailOptions = {
      from: getSenderEmail(),
      to: toEmail,
      subject: '📅 Appointment Confirmation - MediConnect',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #0f172a; color: #ffffff; border-radius: 16px;">
          <h2 style="color: #10b981;">Appointment Confirmed!</h2>
          <p style="font-size: 14px; color: #cbd5e1;">Hello ${appointmentData.patientName},</p>
          <p style="font-size: 14px; color: #cbd5e1;">Your telehealth consultation with <strong>${appointmentData.doctorName}</strong> has been successfully booked.</p>
          <div style="background-color: #1e293b; padding: 16px; border-radius: 12px; margin: 20px 0; color: #cbd5e1; font-size: 13px;">
            <p style="margin: 4px 0;"><strong>Doctor:</strong> ${appointmentData.doctorName} (${appointmentData.specialty})</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> ${appointmentData.date}</p>
            <p style="margin: 4px 0;"><strong>Time:</strong> ${appointmentData.timeSlot}</p>
            <p style="margin: 4px 0;"><strong>Fee:</strong> $${appointmentData.amount}</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">Log into your MediConnect dashboard to join the video room at the scheduled time.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Appointment confirmation email sent via SMTP to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`[Email Service Error] Failed to send appointment email to ${toEmail}:`, error.message);
    return false;
  }
};

const sendDoctorStatusEmail = async (toEmail, doctorName, status) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[Email Service Notice] SMTP not configured. Doctor status updated to ${status} for ${toEmail}`);
    return false;
  }

  try {
    const isApproved = status === 'APPROVED';
    const mailOptions = {
      from: getSenderEmail(),
      to: toEmail,
      subject: `🩺 Medical License Application ${isApproved ? 'Approved' : 'Updated'} - MediConnect`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #0f172a; color: #ffffff; border-radius: 16px;">
          <h2 style="color: ${isApproved ? '#10b981' : '#ef4444'};">Medical License ${status}</h2>
          <p style="font-size: 14px; color: #cbd5e1;">Dear Dr. ${doctorName},</p>
          <p style="font-size: 14px; color: #cbd5e1;">Your medical credential verification status has been updated to <strong>${status}</strong> by the MediConnect Administration.</p>
          ${
            isApproved
              ? `<p style="font-size: 13px; color: #a7f3d0;">Congratulations! You are now authorized to accept patient appointments and conduct WebRTC video consultations on MediConnect.</p>`
              : `<p style="font-size: 13px; color: #fca5a5;">Please contact support if you have questions regarding your application verification status.</p>`
          }
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Doctor license status email sent via SMTP to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`[Email Service Error] Failed to send doctor status email to ${toEmail}:`, error.message);
    return false;
  }
};

module.exports = { sendPasswordResetEmail, sendAppointmentConfirmationEmail, sendDoctorStatusEmail };
