const expressAsyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const sendMail = require('../utils/sendMail');

// Controller to book an appointment
const bookAppointment = expressAsyncHandler(async (req, res) => {
    const { service, date, time, name, email, phone } = req.body;

    if (!service || !date || !time || !name || !email || !phone) {
        return res.status(400).json({
            success: false,
            message: 'Service, date, time, name, email, and phone are required.',
        });
    }


    const newAppointment = new Appointment({
        service,
        date,
        time,
        name,
        email,
        phone,
    });
    await newAppointment.save();

    const adminEmail = process.env.EMAIL_USER;

    // Construct the HTML email for the user
    const userHtmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                color: #333;
                margin: 0;
                padding: 0;
                list-style: none;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .email-header {
                background-color: black;
                color: white;
                text-align: center;
                padding: 20px;
            }
            .email-header img {
                max-width: 200px;
                margin-bottom: 10px;
            }
            .email-body {
                padding: 20px;
                line-height: 1.6;
                color: black;
            }
            .email-footer {
                background-color: #f4f4f4;
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: black;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <img src="https://res.cloudinary.com/dytiwfqmq/image/upload/v1732294265/wuzhgfzrheyc6xvrmgoi.jpg" alt="Company Logo">
                <h1>Appointment Confirmation</h1>
            </div>
            <div class="email-body">
                <p>Dear ${name},</p>
                <p>Your appointment has been confirmed. Below are your appointment details:</p>
                <ul>
                    <li><strong>Service:</strong> ${service}</li>
                    <li><strong>Date:</strong> ${date}</li>
                    <li><strong>Time:</strong> ${time}</li>
                </ul>
                <p>We look forward to serving you. If you have any questions, feel free to contact us.</p>
            </div>
            <div class="email-footer">
                <p>Sanze Beauty © 2024 | All rights reserved.</p>
                <p><a href="https://www.sanzebeauty.com/" style="color: purple;">Visit our website</a></p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Construct the HTML email for the admin
    const adminHtmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Appointment</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                color: #333;
                margin: 0;
                padding: 0;
                list-style: none;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .email-header {
                background-color: black;
                color: white;
                text-align: center;
                padding: 20px;
            }
            .email-header img {
                max-width: 200px;
                margin-bottom: 10px;
            }
            .email-body {
                padding: 20px;
                line-height: 1.6;
            }
            .email-footer {
                background-color: #f4f4f4;
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: black;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <img src="https://res.cloudinary.com/dytiwfqmq/image/upload/v1732294265/wuzhgfzrheyc6xvrmgoi.jpg" alt="Company Logo">
                <h1>New Appointment Confirmation</h1>
            </div>
            <div class="email-body">
                <p>A new appointment has been booked by:</p>
                <ul>
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Phone:</strong> ${phone}</li>
                    <li><strong>Service:</strong> ${service}</li>
                    <li><strong>Date:</strong> ${date}</li>
                    <li><strong>Time:</strong> ${time}</li>
                </ul>
            </div>
            <div class="email-footer">
                <p>Sanze Beauty © 2024 | All rights reserved.</p>
                <p><a href="https://www.sanzebeauty.com/" style="color: purple;">Visit our website</a></p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send the email to the user
    await sendMail({
        to: email,
        subject: 'Appointment Confirmation',
        html: userHtmlContent,
    });

    // Send the email to the admin
    await sendMail({
        to: adminEmail,
        subject: 'New Appointment Confirmed',
        html: adminHtmlContent,
    });

    res.status(201).json({
        success: true,
        message: 'Appointment confirmed and acknowledgment emails sent.',
        appointment: newAppointment,
    });
});


// Controller to reschedule an appointment
const rescheduleAppointment = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
        return res.status(400).json({ success: false, message: 'New date and time are required.' });
    }

    const appointment = await Appointment.findById(id).populate('service', 'name');
    if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    appointment.date = date;
    appointment.time = time;
    await appointment.save();

    const adminEmail = process.env.EMAIL_USER;

    const logoUrl = 'https://res.cloudinary.com/dytiwfqmq/image/upload/v1732294265/wuzhgfzrheyc6xvrmgoi.jpg';

    const userHtmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Rescheduled</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                color: #333;
                margin: 0;
                padding: 0;
                list-style: none;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .email-header {
                background-color: black;
                color: white;
                text-align: center;
                padding: 20px;
            }
            .email-header img {
                max-width: 200px;
                margin-bottom: 10px;
            }
            .email-body {
                padding: 20px;
                line-height: 1.6;
            }
            .email-footer {
                background-color: #f4f4f4;
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: black;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <img src="${logoUrl}" alt="Sanze Beauty Logo">
                <h1>Appointment Rescheduled</h1>
            </div>
            <div class="email-body">
                <p>Dear ${appointment.name},</p>
                <p>Your appointment has been successfully rescheduled. Below are the updated details:</p>
                <ul>
                    <li><strong>Service:</strong> ${appointment.service.name}</li>
                    <li><strong>Date:</strong> ${date}</li>
                    <li><strong>Time:</strong> ${time}</li>
                </ul>
                <p>Thank you for choosing Sanze Beauty. We look forward to serving you!</p>
            </div>
            <div class="email-footer">
                <p>Sanze Beauty © 2024 | All rights reserved.</p>
                <p><a href="https://sanzebeauty.com/" style="color: purple;">Visit our website</a></p>
            </div>
        </div>
    </body>
    </html>`;

    const adminHtmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Rescheduled</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                color: #333;
                margin: 0;
                padding: 0;
                list-style: none;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .email-header {
                background-color: black;
                color: white;
                text-align: center;
                padding: 20px;
            }
            .email-header img {
                max-width: 200px;
                margin-bottom: 10px;
            }
            .email-body {
                padding: 20px;
                line-height: 1.6;
            }
            .email-footer {
                background-color: #f4f4f4;
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: black;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <img src="${logoUrl}" alt="Sanze Beauty Logo">
                <h1>Appointment Rescheduled</h1>
            </div>
            <div class="email-body">
                <p>The following appointment has been rescheduled:</p>
                <ul>
                    <li><strong>Name:</strong> ${appointment.name}</li>
                    <li><strong>Email:</strong> ${appointment.email}</li>
                    <li><strong>Service:</strong> ${appointment.service.name}</li>
                    <li><strong>New Date:</strong> ${date}</li>
                    <li><strong>New Time:</strong> ${time}</li>
                </ul>
            </div>
            <div class="email-footer">
                <p>Sanze Beauty © 2024 | All rights reserved.</p>
                <p><a href="https://sanzebeauty.com/" style="color: purple;">Visit our website</a></p>
            </div>
        </div>
    </body>
    </html>`;

    await sendMail({
        to: appointment.email,
        subject: 'Appointment Rescheduled',
        html: userHtmlContent,
    });

    await sendMail({
        to: adminEmail,
        subject: 'Appointment Rescheduled',
        html: adminHtmlContent,
    });

    res.status(200).json({
        success: true,
        message: 'Appointment rescheduled successfully, acknowledgment emails sent.',
        appointment,
    });
});



// Controller to cancel an appointment
const cancelAppointment = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    const appointment = await Appointment.findById(id).populate('service', 'name');
    if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    appointment.status = 'canceled';
    await appointment.save();

    const adminEmail = process.env.EMAIL_USER;

    const logoUrl = 'https://res.cloudinary.com/dytiwfqmq/image/upload/v1732294265/wuzhgfzrheyc6xvrmgoi.jpg';

    const userHtmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Canceled</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                color: #333;
                margin: 0;
                padding: 0;
                list-style: none;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .email-header {
                background-color: black;
                color: white;
                text-align: center;
                padding: 20px;
            }
            .email-header img {
                max-width: 200px;
                margin-bottom: 10px;
            }
            .email-body {
                padding: 20px;
                line-height: 1.6;
                color: black;
            }
            .email-footer {
                background-color: #f4f4f4;
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: black;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <img src="${logoUrl}" alt="Sanze Beauty Logo">
                <h1>Appointment Canceled</h1>
            </div>
            <div class="email-body">
                <p>Dear ${appointment.name},</p>
                <p>Your appointment for the service <strong>${appointment.service.name}</strong> has been canceled as requested.</p>
                <p>We hope to assist you with another appointment soon.</p>
            </div>
            <div class="email-footer">
                <p>Sanze Beauty © 2024 | All rights reserved.</p>
                <p><a href="https://sanzebeauty.com/" style="color: purple;">Visit our website</a></p>
            </div>
        </div>
    </body>
    </html>`;

    const adminHtmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Canceled</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                color: #333;
                margin: 0;
                padding: 0;
                list-style: none;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .email-header {
                background-color: black;
                color: white;
                text-align: center;
                padding: 20px;
            }
            .email-header img {
                max-width: 200px;
                margin-bottom: 10px;
            }
            .email-body {
                padding: 20px;
                line-height: 1.6;
                color: black;
            }
            .email-footer {
                background-color: #f4f4f4;
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: black;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <img src="${logoUrl}" alt="Sanze Beauty Logo">
                <h1>Appointment Canceled</h1>
            </div>
            <div class="email-body">
                <p>An appointment has been canceled:</p>
                <ul>
                    <li><strong>Name:</strong> ${appointment.name}</li>
                    <li><strong>Email:</strong> ${appointment.email}</li>
                    <li><strong>Service:</strong> ${appointment.service.name}</li>
                    <li><strong>Status:</strong> Canceled</li>
                </ul>
            </div>
            <div class="email-footer">
                <p>Sanze Beauty © 2024 | All rights reserved.</p>
                <p><a href="https://sanzebeauty.com/" style="color: purple;">Visit our website</a></p>
            </div>
        </div>
    </body>
    </html>`;

    await sendMail({
        to: appointment.email,
        subject: 'Appointment Canceled',
        html: userHtmlContent,
    });

    await sendMail({
        to: adminEmail,
        subject: 'Appointment Canceled',
        html: adminHtmlContent,
    });

    res.status(200).json({
        success: true,
        message: 'Appointment canceled successfully, acknowledgment emails sent.',
        appointment,
    });
});



// Controller to get all appointments
const getAllAppointments = expressAsyncHandler(async (req, res) => {
    const appointments = await Appointment.find()
        .populate('service', 'name');

    res.status(200).json({
        success: true,
        message: 'Appointments retrieved successfully.',
        data: appointments,
    });
});

// Controller to get appointments by user email
const getUserAppointments = expressAsyncHandler(async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required to fetch appointments.' });
    }

    const appointments = await Appointment.find({ email }).populate('service', 'name');

    if (!appointments || appointments.length === 0) {
        return res.status(404).json({ success: false, message: 'No appointments found for this user.' });
    }

    res.status(200).json({
        success: true,
        message: 'User appointments retrieved successfully.',
        data: appointments,
    });
});

// Controller to get a single appointment
const getSingleAppointment = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
        .populate('service', 'name');

    if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.status(200).json({
        success: true,
        message: 'Appointment retrieved successfully.',
        data: appointment,
    });
});

// Controller to delete an appointment
const deleteAppointment = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    await Appointment.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: 'Appointment deleted successfully.',
    });
});

module.exports = {
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    getAllAppointments,
    getUserAppointments,
    getSingleAppointment,
    deleteAppointment,
};
