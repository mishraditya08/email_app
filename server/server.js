// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const agenda = require('./utils/agenda'); // Import Agenda instance
const nodemailer = require('nodemailer');
const Email = require('./models/emails'); // Ensure this model is defined
const app = express();
const Template = require('./models/templates')

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// Agenda job for sending scheduled emails
agenda.define('send email', async (job) => {
  const { to, subject, text } = job.attrs.data;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
});

// Route for scheduling emails
app.post('/api/emails/schedule', async (req, res) => {
  const { nodes, edges, emailData } = req.body;

  console.log('Received request:', { nodes, edges, emailData });

  if (!Array.isArray(nodes)) {
    return res.status(400).json({ error: '`nodes` must be an array.' });
  }

  try {
    for (let node of nodes) {
      if (node.data.label === 'Cold Email') {

        const delayInSeconds = emailData.delay || 0;
        if (isNaN(delayInSeconds) || delayInSeconds < 0) {
          return res.status(400).json({ error: 'Invalid delay value.' });
        }
        const scheduledTime = new Date(Date.now() + delayInSeconds * 1000); // delay in seconds

        const email = new Email({
          to: emailData.to,
          subject: emailData.subject || 'Cold Email',
          text: emailData.text || 'Hello!',
          scheduledTime,
        });
        await email.save();

        console.log(`Scheduling email for ${node.data.label} at ${scheduledTime}`);

        await agenda.schedule(scheduledTime, 'send email', {
          to: emailData.to,
          subject: emailData.subject || 'Cold Email',
          text: emailData.text || 'Hello!',
        });
      }
    }

    res.status(200).json({ message: 'Emails scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling email:', error);
    res.status(500).json({ error: 'Error scheduling email' });
  }
});

app.get('/api/templates', async (req, res) => {
    try {
      const templates = await Template.find(); // Fetch all templates from the database
      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start your server
app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});