const BOQ = require('../models/BOQ');

const calculateBOQTotal = (items) => {
  return items.reduce((total, item) => {
    item.amount = item.quantity * item.rate;
    return total + item.amount;
  }, 0);
};

const createBOQFromTemplate = async (projectId, templateItems) => {
  const totalAmount = calculateBOQTotal(templateItems);
  
  const boq = new BOQ({
    project: projectId,
    items: templateItems,
    totalAmount
  });
  
  return await boq.save();
};

module.exports = { calculateBOQTotal, createBOQFromTemplate };