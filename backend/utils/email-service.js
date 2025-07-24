const nodemailer = require('nodemailer');
const env = require('../config/env');

const sendEmail = async ({ to, subject, html, senderEmail, senderName }) => {
    try {
        const fromEmail = senderEmail || env.email.emailFrom;
        const fromName = senderName || env.email.emailFromName || 'No Reply';

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: env.email.gmailUser,
                pass: env.email.gmailAppPassword,
            },
        });

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            html,
        };

        const response = await transporter.sendMail(mailOptions);

        console.log(`Email sent to ${to}: ${response.messageId}`);
        return response;
    } catch (error) {
        console.log('Gmail SMTP email sending failed:', error.message || error);
        throw new Error('Failed to send email');
    }
};

module.exports = { sendEmail };
