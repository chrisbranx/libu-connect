const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_ADDRESS = process.env.SMTP_FROM || 'noreply@libuconnect.com';

async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"LIBU Connect" <${FROM_ADDRESS}>`,
    to: email,
    subject: 'Password Reset - LIBU Connect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1E1B4B;">Password Reset Request</h2>
        <p>You requested a password reset for your LIBU Connect account.</p>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1E1B4B; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 12px;">LIBU Connect - Liberty University</p>
      </div>
    `,
  });
}

async function sendWelcomeEmail(email, firstName) {
  await transporter.sendMail({
    from: `"LIBU Connect" <${FROM_ADDRESS}>`,
    to: email,
    subject: 'Welcome to LIBU Connect!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1E1B4B;">Welcome to LIBU Connect, ${firstName}!</h2>
        <p>Your account has been created successfully.</p>
        <p>Get started by exploring your schedule, connecting with classmates, and staying up to date with campus activities.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #1E1B4B; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Go to Dashboard</a>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 12px;">LIBU Connect - Liberty University</p>
      </div>
    `,
  });
}

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
