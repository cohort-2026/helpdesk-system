import nodemailer from 'nodemailer';

export interface TicketAssignedEmailData {
    recipientEmail: string;
    recipientName: string;
    ticketId: number;
    ticketTitle: string;
    assigneeName: string;
    status: string;
}

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

export const sendTicketAssignedEmail = async (data: TicketAssignedEmailData) => {
    const { recipientEmail, recipientName, ticketId, ticketTitle, assigneeName, status } = data;

    if (!recipientEmail || recipientEmail.trim() === '') {
        console.warn(`[emailService] Cannot send assignment email for ticket #${ticketId}: recipient email is missing`);
        return;
    }

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
        to: recipientEmail,
        subject: `[Ticket #${ticketId}] Ticket Assigned: ${ticketTitle}`,
        text: `Hello ${recipientName || 'User'},\n\nYour support ticket #${ticketId} ("${ticketTitle}") has been assigned to support agent ${assigneeName}.\n\nTicket Status: ${status}\n\nOur team is working on your request and will follow up shortly.\n\nBest regards,\nThe Helpdesk Team`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #2563eb; margin-top: 0;">Ticket Assignment Update</h2>
                <p>Hello <strong>${recipientName || 'User'}</strong>,</p>
                <p>Your support ticket has been assigned to a support agent who is now reviewing your request.</p>
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0 0 8px 0;"><strong>Ticket ID:</strong> #${ticketId}</p>
                    <p style="margin: 0 0 8px 0;"><strong>Title:</strong> ${ticketTitle}</p>
                    <p style="margin: 0 0 8px 0;"><strong>Status:</strong> <span style="background-color: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-weight: 500;">${status}</span></p>
                    <p style="margin: 0;"><strong>Assigned Agent:</strong> ${assigneeName}</p>
                </div>
                <p>You can track the progress of your ticket on the Helpdesk portal.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="font-size: 13px; color: #6b7280; margin: 0;">Best regards,<br/><strong>The Helpdesk Support Team</strong></p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[emailService] Assignment notification sent for ticket #${ticketId} to ${recipientEmail}: ${info.messageId}`);
    } catch (error) {
        console.error(`[emailService] Failed to send assignment notification for ticket #${ticketId}:`, error);
    }
};

