const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorMiddleware');
const leadRoutes = require('./routes/leadRoutes');
const clientRoutes = require('./routes/clientRoutes');
const projectRoutes = require('./routes/projectRoutes');
const boqRoutes = require('./routes/boqRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const accountRoutes = require('./routes/accountRoutes');
const reportRoutes = require('./routes/reportRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
// Connect to database
connectDB();
// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173"
    
  ],
  credentials: true
}));
app.use(express.json());
// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Invertry ERP Backend API',
  });
});
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/leads', leadRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/boq', boqRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
// Error handling
app.use(errorHandler);

module.exports = app;