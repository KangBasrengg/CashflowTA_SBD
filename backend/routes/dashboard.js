const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', dashboardController.getDashboard);
router.get('/chart', dashboardController.getChartData);
router.get('/reports/monthly', dashboardController.getMonthlyReport);

module.exports = router;
