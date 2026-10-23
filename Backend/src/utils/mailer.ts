
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${token}`;

 return await transporter.sendMail({
    from: `"Help Desk" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your Help Desk password",
    text: `Hi,

Here is your link to reset your Help Desk password. It expires in 30 minutes.

Didn’t request this? Ignore this email. Your current password will keep working.:\n\n${resetLink}\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetLink}">Click here to choose a new password</a> (valid for 30 minutes).</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
};