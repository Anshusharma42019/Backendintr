const PDFDocument = require('pdfkit');

const generateInvoicePDF = (invoice) => {
  const doc = new PDFDocument();
  
  doc.fontSize(20).text('Invoice', 50, 50);
  doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 100);
  doc.text(`Client: ${invoice.client.name}`, 50, 120);
  doc.text(`Amount: $${invoice.amount}`, 50, 140);
  doc.text(`Due Date: ${invoice.dueDate}`, 50, 160);
  
  return doc;
};

module.exports = { generateInvoicePDF };