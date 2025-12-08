const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendInvoiceEmail = async (client, invoice) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: client.email,
    subject: `Invoice ${invoice.invoiceNumber}`,
    html: `
      <h2>Invoice ${invoice.invoiceNumber}</h2>
      <p>Dear ${client.name},</p>
      <p>Please find your invoice for amount $${invoice.amount}</p>
      <p>Due Date: ${invoice.dueDate}</p>
    `
  };
  
  return await transporter.sendMail(mailOptions);
};

module.exports = { sendInvoiceEmail };