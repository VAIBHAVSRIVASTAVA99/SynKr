import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let transporter;

export const setupEmailService = async () => {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify connection configuration
    await transporter.verify();
    console.log("Email service configured successfully");
  } catch (error) {
    console.error("Error setting up email service:", error);
    throw error;
  }
};

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendWelcomeEmail = async (user) => {
  const subject = "Welcome to Our Platform!";
  const text = `Welcome ${user.name}! We're excited to have you on board.`;
  const html = `
    <h1>Welcome ${user.name}!</h1>
    <p>We're excited to have you on board.</p>
    <p>Get started by exploring our features and connecting with others.</p>
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
}; 