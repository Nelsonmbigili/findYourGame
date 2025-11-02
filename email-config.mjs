import nodemailer from 'nodemailer';
import './config.mjs'; 

// Create a transporter object using Ethereal/SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (toEmail, token) => {
  const resetUrl = `https://findyourgame.onrender.com/:${process.env.PORT || 3000}/resetpassword/${token}`;

 const mailOptions = {
  from: `"FindYourGame Support" <${process.env.EMAIL_FROM}>`,
  to: toEmail,
  subject: 'Reset Your Password — FindYourGame',
  text: `
      Hello!

      We received a request to reset the password for your FindYourGame account.

      Click the link below to set a new password:
      ${resetUrl}

      This link will expire in 10 Minutes.

      If you didn’t request a password reset, you can safely ignore this message — your account will remain secure.

      Game on! 🎮
      — FindYourGame Team
      `,
  html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://findyourgame.onrender.com/favicon.png" alt="FindYourGame" width="50" style="border-radius: 8px;"/>
            </div>

            <h2 style="color:#333; text-align:center;">Reset Your Password</h2>

            <p style="font-size: 15px; color: #555;">
              Hello! 👋  
              <br><br>
              You requested to reset your FindYourGame account password.
            </p>

            <p style="font-size: 15px; color: #555;">
              Click the button below to create a new password:
            </p>

            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetUrl}" style="background: green; padding: 12px 22px; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Reset Password
              </a>
            </div>

            <p style="font-size: 14px; color: #777;">
              If the button doesn't work, copy and paste this link in your browser:
              <br>
              <a href="${resetUrl}" style="color:#4a6cf7;">${resetUrl}</a>
            </p>

            <p style="font-size: 14px; color: #777;">
              🔒 This link expires in <strong>10 Minutes</strong>.
              <br><br>
              Didn’t request this? Just ignore this email — your account is safe.
            </p>

            <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">

            <p style="font-size: 13px; color: #999; text-align:center;">
              🎮 FindYourGame — Discover. Join. Play.<br>
              <a href="https://findyourgame.onrender.com" style="color:#4a6cf7;">Visit Website</a>
            </p>
        </div>
      `
};


  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    // Preview URL for Ethereal:
    if (process.env.EMAIL_HOST === 'smtp.ethereal.email') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Could not send password reset email.');
  }
};
