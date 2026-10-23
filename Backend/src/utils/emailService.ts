import nodemailer from 'nodemailer';

export const sendTempPasswordEmail = async (email: string, tempPassword: string) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true', 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Helpdesk System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Temporary Password',
        text: `Welcome to the Helpdesk System! Your temporary password is: ${tempPassword}\nPlease log in and update your password immediately.`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Welcome to the Helpdesk System!</h2>
                <p>Your account has been created successfully.</p>
                <p>Your temporary password is: <strong>${tempPassword}</strong></p>
                <p>Please log in and update your password immediately.</p>
                <p>Best regards,<br/>The Helpdesk Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
 
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};
