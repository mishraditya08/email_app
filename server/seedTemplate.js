const mongoose = require('mongoose');
const Template = require('./models/templates'); // Adjust the path if necessary

mongoose.connect('mongodb://localhost:27017/email_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const templates = [
  {
    name: 'productReview',
    subject: 'We’d love your feedback on your recent purchase!',
    body: `
      Hi {{name}},

      Thank you for purchasing {{product}}!

      We'd love to hear your thoughts. Please take a moment to leave us a review:
      [Review Now](https://example.com/review)

      Thanks for helping us improve!
      
      Best,  
      The Team
    `,
    placeholders: ['name', 'product']
  },
  {
    name: 'storeVisit',
    subject: 'Come visit us again!',
    body: `
      Hi {{name}},

      Thank you for visiting our store recently!  

      We'd love to see you again soon. Visit us for exclusive offers and new arrivals:  
      [Visit Us](https://example.com/store)  

      Looking forward to seeing you again!  

      Cheers,  
      The Team  
    `,
    placeholders: ['name']
  }
];

Template.insertMany(templates)
  .then(() => {
    console.log('Templates added successfully');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('Error adding templates:', err);
  });
