const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// SMTP configuration for Brevo
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: '76de62001@smtp-brevo.com',
    pass: 'xpPFaqSz875Of3CI'
  }
});

// MySQL connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'contactdb'
};

// Route to handle form submission
app.post('/send_email', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO send_email (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject, message]
    );
    await connection.end();
    console.log('Form data saved to database', result.insertId);

    const mailOptions = {
      from: email,
      to: 'hrm@icdt.org.in',
      subject: subject,
      text: message,
      html: `<h2>Contact Form Submission</h2>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Subject:</strong> ${subject}</p>
             <p><strong>Message:</strong><br>${message}</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error occurred:', error);
        return res.status(500).send('Failed to send email.');
      }
      console.log('Message sent:', info.messageId);
      res.status(200).send('Email sent successfully!');
    });

  } catch (error) {
    console.error('Error saving form data to database', error);
    res.status(500).send('Failed to save form data to database.');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
