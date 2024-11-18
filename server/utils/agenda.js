const Agenda = require('agenda');
const nodemailer = require('nodemailer');
require('dotenv').config();

const agenda = new Agenda({ db: { address: process.env.MONGODB_URI, collection: 'agendaJobs' } });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

agenda.on('ready', async () => {
    try {
      await agenda.start();  // Start the worker
      console.log('Agenda worker started...');
    } catch (error) {
      console.error('Failed to start Agenda worker:', error);
    }
  });

agenda.on('error', (err) => {
  console.error('Agenda encountered an error:', err);
});

agenda.on('start', (job) => {
  console.log(`Job ${job.attrs.name} is starting`);
});

agenda.on('complete', (job) => {
  console.log(`Job ${job.attrs.name} completed`);
});

agenda.on('fail', (err, job) => {
  console.error(`Job ${job.attrs.name} failed with error:`, err);
});

// Define the email sending job
agenda.define('send email', async (job) => {
  const { to, subject, text } = job.attrs.data;
  console.log(`Sending email to: ${to} with subject: ${subject}`);
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
});

// Start the Agenda worker
(async () => {
  try {
    await agenda.start();
    console.log('Agenda worker started...');
  } catch (error) {
    console.error('Failed to start Agenda worker:', error);
  }
})();

module.exports = agenda;
