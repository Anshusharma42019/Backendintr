const Lead = require('../models/Lead');
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const Material = require('../models/Material');

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all data
    const [leads, projects, invoices, materials] = await Promise.all([
      Lead.find(),
      Project.find().populate('client'),
      Invoice.find(),
      Material.find()
    ]);

    // Calculate main stats
    const totalLeads = leads.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length;
    const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.finalAmount || inv.amount || 0), 0);
    const lowStockItems = materials.filter(m => m.currentStock <= m.minStock);

    // Monthly stats
    const thisMonthLeads = leads.filter(l => new Date(l.createdAt) >= startOfMonth).length;
    const thisMonthProjects = projects.filter(p => new Date(p.createdAt) >= startOfMonth);
    const thisMonthStartedProjects = thisMonthProjects.length;
    const thisMonthCompletedProjects = projects.filter(p => 
      p.status === 'completed' && new Date(p.updatedAt) >= startOfMonth
    ).length;
    const thisMonthRevenue = invoices
      .filter(i => new Date(i.createdAt) >= startOfMonth)
      .reduce((sum, inv) => sum + (inv.finalAmount || inv.amount || 0), 0);

    // Leads needing follow-up (leads that haven't been updated in 7 days and are not converted)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const leadsNeedingFollowup = leads.filter(l => 
      l.status !== 'converted' && 
      l.status !== 'lost' && 
      new Date(l.updatedAt) < sevenDaysAgo
    ).length;

    // Recent data (last 5 items)
    const recentProjects = projects
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    const recentLeads = leads
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      stats: {
        totalLeads,
        activeProjects,
        pendingInvoices,
        totalRevenue,
        completedProjects,
        lowStockItems: lowStockItems.length
      },
      alerts: {
        lowStockCount: lowStockItems.length,
        overdueInvoices,
        leadsNeedingFollowup
      },
      monthlyStats: {
        newLeads: thisMonthLeads,
        projectsStarted: thisMonthStartedProjects,
        projectsCompleted: thisMonthCompletedProjects,
        revenue: thisMonthRevenue
      },
      recentData: {
        projects: recentProjects,
        leads: recentLeads
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
};