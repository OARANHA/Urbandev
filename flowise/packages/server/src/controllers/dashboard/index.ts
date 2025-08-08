import { Router } from 'express'
import dashboardController from './dashboard.controller'

const router = Router()

// Dashboard Statistics
router.get('/stats', dashboardController.getDashboardStats)
router.get('/stats/overview', dashboardController.getOverviewStats)
router.get('/stats/performance', dashboardController.getPerformanceStats)

// Activity Timeline
router.get('/activity', dashboardController.getDashboardActivity)
router.get('/activity/recent', dashboardController.getRecentActivity)

// Analytics
router.get('/analytics', dashboardController.getAnalytics)
router.get('/analytics/trends', dashboardController.getTrends)
router.get('/analytics/comparison', dashboardController.getComparisonData)

export default router