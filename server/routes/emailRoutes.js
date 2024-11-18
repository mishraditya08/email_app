const express = require('express');
const router = express.Router();
const agenda = require('../utils/agenda');
const Email = require('../models/emails');
const Template = require('../models/templates'); // Access Template model

router.post('/schedule', async (req, res) => {
    const { nodes, edges, emailData } = req.body;
  
    try {
      for (let node of nodes) {
        if (node.data.label === 'Cold Email') {
          // Fetch the desired template from the database
          const template = await Template.findOne({ name: 'productReview' });
  
          if (!template) {
            return res.status(404).json({ error: 'Email template not found' });
          }
  
          const placeholders = { name: 'John Doe', product: 'Smartphone X' }; // Dynamic data example
          let emailBody = template.body;
          Object.keys(placeholders).forEach((key) => {
            emailBody = emailBody.replace(`{{${key}}}`, placeholders[key]);
          });
  
          // Set the scheduled time using the delay (in minutes) from emailData
          const scheduledTime = new Date(Date.now() + emailData.delay * 60 * 1000); // delay in minutes
  
          // Create the email object and save it
          const email = new Email({
            to: emailData.to,
            subject: template.subject,
            text: emailBody,
            scheduledTime,
          });
          await email.save();
          console.log("Email saved:", email);
  
          // Schedule the email using Agenda
          console.log("Job scheduled:", scheduledTime);
          agenda.schedule(scheduledTime, 'send email', {
            to: emailData.to,
            subject: emailData.subject || template.subject,
            text: emailBody.txt || "hello!",
          })
          .then(() => {
              console.log(`Job scheduled for: ${scheduledTime}`);
          })
          .catch(err => {
              console.error('Error scheduling job:', err);
          });
        }
      }
  
      res.status(200).json({ message: 'Emails scheduled successfully' });
    } catch (error) {
      console.error('Error scheduling email:', error);
      res.status(500).json({ error: 'Error scheduling email' });
    }
  });
  
