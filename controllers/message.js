const expressAsyncHandler = require('express-async-handler');
const sendMail = require('../utils/sendMail'); // Assumes you have a utility for sending emails

// Controller to handle sending an email from the contact form
const sendMessage = expressAsyncHandler(async (req, res) => {
    const { firstName, lastName, phone, email, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phone || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required: firstName, lastName, phone, email, and message.',
        });
    }

    // Admin or support email address from environment variables
    const adminEmail = process.env.EMAIL_USER;

    // Email content
    const subject = `New  Message from ${firstName} ${lastName}`;
    const html = `
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
    `;

    // Send email to admin
    await sendMail({
        to: adminEmail,
        subject,
        html,
    });

    res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully. We will get back to you shortly.',
    });
});

module.exports = {
    sendMessage,
};
