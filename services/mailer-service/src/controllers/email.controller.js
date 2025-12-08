const transporter = require('../config/nodemailer');
const templateService = require('../services/template.service');

exports.sendEmail = async (req, res) => {
    const { to, subject, html, template, data } = req.body;

    try {
        let emailHtml = html;

        // If template name is provided, generate HTML using the template
        if (template) {
            emailHtml = templateService.generateEmailContent(template, data);
        }

        if (!emailHtml) {
            return res.status(400).json({ success: false, message: 'Email content (html or template) is required' });
        }

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: emailHtml
        });

        console.log('Message sent: %s', info.messageId);
        res.status(200).json({ success: true, message: 'Email sent successfully', messageId: info.messageId });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
    }
};
