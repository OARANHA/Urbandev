import { Request, Response } from 'express'
import { dashboardService } from '../../services/dashboard.service'
import { logger } from '../../utils/logger'

class DashboardController {
    /**
     * Get complete dashboard statistics
     */
    getDashboardStats = async (req: Request, res: Response) => {
        try {
            const stats = await dashboardService.getDashboardStats()
            res.json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            })
        } catch (error) {
            logger.error('Error fetching dashboard stats:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to fetch dashboard statistics'
            })
        }
    }

    /**
     * Get overview statistics (simplified version)
     */
    getOverviewStats = async (req: Request, res: Response) => {
        try {
            const overview = await dashboardService.getOverviewStats()
            res.json({
                success: true,
                data: overview,
                timestamp: new Date().toISOString()
            })
        } catch (error) {
            logger.error('Error fetching overview stats:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to fetch overview statistics'
            })
        }
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats = async (req: Request, res: Response) => {
        try {
            const performance = await dashboardService.getPerformanceStats()
            res.json({
                success: true,
                data: performance,
                timestamp: new Date().toISOString()
            })
        } catch (error) {
            logger.error('Error fetching performance stats:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to fetch performance statistics'
            })
        }
    }

    /**
     * Get activity timeline
     */
    getDashboardActivity = async (req: Request, res: Response) => {
        try {
            const { limit = 50, offset = 0, type, startDate, endDate } = req.query
            
            const filters = {
                limit: parseInt(limit as string),
                offset: parseInt(offset as string),
                type: type as string,
                startDate: startDate as string,
                endDate: endDate as string
            }

            const activities = await dashboardService.getActivityTimeline(filters)
            res.json({
                success: true,
                data: activities,
                filters,
                timestamp: new Date().toISOString()
            })
        } catch (error) {
            logger.error('Error fetching activity timeline:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to fetch activity timeline'
            })
        }
    }

    /**
     * Get recent activities (last 24 hours)
     */
    getRecentActivity = async (req: Request, res: Response) => {
        try {
            const { limit = 10 } = req.query
            const activities = await dashboardService.getRecentActivity(parseInt(limit as string))
            res.json({
                success: true,
                data: activities,
                timestamp: new Date().toISOString()
            })
        } catch (error) {
            logger.error('Error fetching recent activity:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to fetch recent activity'
            })
        }
    }

    /**
     * Get analytics data
     */
    getAnalytics = async (req: Request, res: Response) => {
        try {
            const { period = '7d', metrics } = req.query
            const analytics = await dashboardService.getAnalytics(period as string, metrics as string)
            res.json({
                success: true,
                data: analytics,
                period,
                timestamp: new Date().toISOString()
            })
        } catch (error) {
            logger.error('Error fetching analytics:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to fetch analytics'
            })
        }
    }

    /**
     * Get trends data
     */
    getTrends = async (req: Request, res: Response) => {
        try {
            const { period = '30d', metric = 'executions' } = req.query
            const trends = await dashboardService.getTrends(period as string, metric as string)
            res.json({
                success: true,
                data: trends,
                period,
                metric,
                timestamp: new Date().toISOString()
            })
        } catch (error) {
            logger.error('Error fetching trends:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to fetch trends'
            })
        }
    }

    /**
     * Get comparison data
     */
    getComparisonData = async (req: Request, res: Response) => {
        try {
            const { currentPeriod, previousPeriod, metrics } = req.query
            const comparison = await dashboardService.getComparisonData(
                currentPeriod as string,
                previousPeriod as string,
                metrics as string
            )
            res.json({
                success: true,
                data: comparison,
                currentPeriod,
                previousPeriod,
                timestamp: new Date().toISOString()
            })
        } catch (error) {
            logger.error('Error fetching comparison data:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to fetch comparison data'
            })
        }
    }
}

export default new DashboardController()