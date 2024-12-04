const nodemailer = require("nodemailer");

const sendMail = async ({ to, subject, text, html = null }) => {
  try {
    // Log the email details before sending
    console.log("Sending email with the following details:");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Text:", text);
    if (html) console.log("HTML:", html);

    // Create a transporter object using SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // Your SMTP server (e.g., smtp.yourdomain.com)
      port: process.env.SMTP_PORT, // Port (e.g., 587 for TLS, 465 for SSL)
      secure: process.env.SMTP_PORT == 465, // Use SSL if port is 465
      auth: {
        user: process.env.EMAIL_USER, // Your webmail address
        pass: process.env.EMAIL_PASS, // Your webmail password
      },
    });

    // Set up email options
    const mailOptions = {
      from: `"Sanze Beauty" <${process.env.EMAIL_USER}>`, // Sender address
      to, // Receiver(s)
      subject, // Subject line
      text, // Plain text body
      ...(html && { html }), // Conditionally add HTML if provided
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email: " + error.message);
  }
};

module.exports = sendMail;
