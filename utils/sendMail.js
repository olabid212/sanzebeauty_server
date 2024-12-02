const nodemailer = require('nodemailer');

const sendMail = async ({ to, subject, text, html = null }) => {
  try {
    // Log the email details before sending
    console.log('Sending email with the following details:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text);
    if (html) console.log('HTML:', html);

    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your Gmail app password
      },
    });

    // Set up email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to,                           // Receiver(s)
      subject,                      // Subject line
      text,                         // Plain text body
      ...(html && { html }),        // Conditionally add HTML if provided
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

module.exports = sendMail;
