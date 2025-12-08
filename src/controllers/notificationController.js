const Lead = require('../models/Lead');
const Invoice = require('../models/Invoice');
const Material = require('../models/Material');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = [];
    const now = new Date();
    
    // Recent leads (last 24 hours)
    const recentLeads = await Lead.find({
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 }).limit(5);
    
    recentLeads.forEach(lead => {
      const timeAgo = Math.floor((now - new Date(lead.createdAt)) / (1000 * 60));
      notifications.push({
        id: `lead-${lead._id}`,
        type: 'lead',
        title: 'New lead received',
        message: `New lead from ${lead.name} (${lead.source || 'website'})`,
        time: timeAgo < 60 ? `${timeAgo} min ago` : `${Math.floor(timeAgo / 60)} hours ago`,
        priority: 'info',
        createdAt: lead.createdAt
      });
    });
    
    // Overdue invoices
    const overdueInvoices = await Invoice.find({
      status: 'overdue'
    }).sort({ dueDate: 1 }).limit(10);
    
    overdueInvoices.forEach(invoice => {
      const daysOverdue = Math.floor((now - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24));
      notifications.push({
        id: `invoice-${invoice._id}`,
        type: 'invoice',
        title: 'Invoice overdue',
        message: `Invoice ${invoice.invoiceNumber} is ${daysOverdue} days overdue`,
        time: `${daysOverdue} days overdue`,
        priority: 'high',
        createdAt: invoice.dueDate
      });
    });
    
    // Low stock items
    const lowStockItems = await Material.find({
      $expr: { $lte: ['$currentStock', '$minStock'] }
    }).limit(5);
    
    lowStockItems.forEach(material => {
      notifications.push({
        id: `stock-${material._id}`,
        type: 'inventory',
        title: 'Low stock alert',
        message: `${material.name} is running low (${material.currentStock} remaining)`,
        time: 'Now',
        priority: 'medium',
        createdAt: new Date()
      });
    });
    
    // Sort by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(notifications.slice(0, 20)); // Return latest 20 notifications
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: error.message });
  }
};