const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the parent directory (root)
app.use(express.static(path.join(__dirname, '../')));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Contact Endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // High Notification HTML Template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                border: 1px solid #e1e1e1;
            }
            .header {
                background: linear-gradient(135deg, #ffbd39 0%, #ff9f00 100%);
                padding: 40px 20px;
                text-align: center;
                color: #000;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .content {
                padding: 30px;
            }
            .notification-badge {
                display: inline-block;
                padding: 5px 15px;
                background: #fff4e0;
                color: #ffbd39;
                border-radius: 20px;
                font-weight: bold;
                font-size: 12px;
                margin-bottom: 20px;
                text-transform: uppercase;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 15px;
                margin-bottom: 25px;
            }
            .info-item {
                background: #f9f9f9;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #ffbd39;
            }
            .info-label {
                font-size: 12px;
                color: #888;
                text-transform: uppercase;
                margin-bottom: 5px;
            }
            .info-value {
                font-size: 16px;
                font-weight: 600;
                color: #222;
            }
            .message-box {
                background: #fdfdfd;
                padding: 20px;
                border-radius: 8px;
                border: 1px dashed #ddd;
                margin-top: 20px;
            }
            .footer {
                background: #222;
                color: #888;
                text-align: center;
                padding: 20px;
                font-size: 12px;
            }
            .footer p {
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Message Received</h1>
            </div>
            <div class="content">
                <div class="notification-badge">Urgent Priority</div>
                <p>Hello Sujal, you have a new contact form submission from your portfolio website.</p>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Sender Name</div>
                        <div class="info-value">${name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Sender Email</div>
                        <div class="info-value">${email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Subject</div>
                        <div class="info-value">${subject}</div>
                    </div>
                </div>

                <div class="message-box">
                    <div class="info-label">Message Content</div>
                    <div style="white-space: pre-wrap;">${message}</div>
                </div>
            </div>
            <div class="footer">
                <p>This is an automated notification from your portfolio backend.</p>
                <p>&copy; 2026 Clark Portfolio System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`, // Send as self but with sender's name
        to: process.env.RECEIVER_EMAIL,
        subject: `[Portfolio Contact] ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
        html: htmlTemplate
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
