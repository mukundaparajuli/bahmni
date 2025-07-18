const { Resend } = require('resend');
const env = require('../config/env');

const resend = new Resend(env.email.resendApiKey);

const sendEmail = async ({ to, subject, html }) => {
    try {
        const { data, error } = await resend.emails.send({
            from: env.email.emailFrom,
            to,
            subject,
            html,
        });

        if (error) {
            console.log('Resend email sending failed:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }

        console.log(`Email sent to ${to}: ${data.id}`);
        return data;
    } catch (error) {
        console.log('Email sending error:', error);
        throw new Error('Failed to send email');
    }
};

module.exports = { sendEmail };