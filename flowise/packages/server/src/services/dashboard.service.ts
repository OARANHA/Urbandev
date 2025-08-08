import { getDataSource } from '../database/data-source'
import { Chatflow } from '../database/entities/Chatflow'
import { Assistant } from '../database/entities/Assistant'
import { Execution } from '../database/entities/Execution'
import { Customer } from '../database/entities/Customer'
import { supabaseDBService } from './supabase-db.service'
import { logger } from '../utils/logger'

interface DashboardStats {
    overview: {
        totalChatflows: number
        totalAssistants: number
        totalExecutions: number
        totalCustomers: number
        activeUsers: number
    }
    performance: {
        successRate: number
        averageResponseTime: number
        errorRate: number
        uptime: number
    }
    business: {
        revenue: number
        customerRetention: number
        growthRate: number
        conversionRate: number
    }
    trends: {
        daily: Array<{ date: string; value: number }>
        weekly: Array<{ week: string; value: number }>
        monthly: Array<{ month: string; value: number }>
    }
}

interface ActivityItem {
    id: string
    type: 'chatflow' | 'execution' | 'customer' | 'assistant' | 'user'
    action: 'created' | 'updated' | 'deleted' | 'executed'
    description: string
    timestamp: string
    user?: string
    metadata?: any
}

interface AnalyticsData {
    period: string
    metrics: {
        executions: number
        users: number
        chatflows: number
        customers: number
        revenue: number
    }
    trends: Array<{
        date: string
        executions: number
        users: number
        revenue: number
    }>
}

class DashboardService {
    /**
     * Get complete dashboard statistics
     */
    async getDashboardStats(): Promise<DashboardStats> {
        try {
            const [overview, performance, business, trends] = await Promise.all([
                this.getOverviewStats(),
                this.getPerformanceStats(),
                this.getBusinessStats(),
                this.getTrendsData()
            ])

            return {
                overview,
                performance,
                business,
                trends
            }
        } catch (error) {
            logger.error('Error in getDashboardStats:', error)
            throw error
        }
    }

    /**
     * Get overview statistics
     */
    async getOverviewStats() {
        try {
            const AppDataSource = getDataSource()
            
            // Get counts from local database
            const [chatflowCount, assistantCount, executionCount, customerCount] = await Promise.all([
                AppDataSource.getRepository(Chatflow).count(),
                AppDataSource.getRepository(Assistant).count(),
                AppDataSource.getRepository(Execution).count(),
                AppDataSource.getRepository(Customer).count()
            ])

            // Get active users from Supabase
            const activeUsers = await this.getActiveUsersCount()

            return {
                totalChatflows: chatflowCount,
                totalAssistants: assistantCount,
                totalExecutions: executionCount,
                totalCustomers: customerCount,
                activeUsers
            }
        } catch (error) {
            logger.error('Error in getOverviewStats:', error)
            throw error
        }
    }

    /**
     * Get performance statistics
     */
    async getPerformanceStats() {
        try {
            const AppDataSource = getDataSource()
            
            // Get execution statistics
            const executionRepo = AppDataSource.getRepository(Execution)
            const totalExecutions = await executionRepo.count()
            const failedExecutions = await executionRepo.count({
                where: {
                    status: 'error'
                }
            })

            // Calculate success rate
            const successRate = totalExecutions > 0 
                ? ((totalExecutions - failedExecutions) / totalExecutions) * 100 
                : 100

            // Get average response time (mock data for now)
            const averageResponseTime = await this.getAverageResponseTime()

            // Calculate error rate
            const errorRate = totalExecutions > 0 
                ? (failedExecutions / totalExecutions) * 100 
                : 0

            // System uptime (mock - should be calculated from monitoring)
            const uptime = 99.9

            return {
                successRate: Math.round(successRate * 100) / 100,
                averageResponseTime: Math.round(averageResponseTime * 100) / 100,
                errorRate: Math.round(errorRate * 100) / 100,
                uptime
            }
        } catch (error) {
            logger.error('Error in getPerformanceStats:', error)
            throw error
        }
    }

    /**
     * Get business statistics
     */
    async getBusinessStats() {
        try {
            // Get customer data from Supabase
            const customerStats = await supabaseDBService.getCustomerStats()
            
            // Calculate business metrics
            const revenue = await this.calculateRevenue()
            const customerRetention = await this.calculateCustomerRetention()
            const growthRate = await this.calculateGrowthRate()
            const conversionRate = await this.calculateConversionRate()

            return {
                revenue,
                customerRetention,
                growthRate,
                conversionRate
            }
        } catch (error) {
            logger.error('Error in getBusinessStats:', error)
            throw error
        }
    }

    /**
     * Get activity timeline
     */
    async getActivityTimeline(filters: any = {}): Promise<{ activities: ActivityItem[]; total: number }> {
        try {
            const { limit = 50, offset = 0, type, startDate, endDate } = filters

            // Get activities from different sources
            const [chatflowActivities, executionActivities, customerActivities] = await Promise.all([
                this.getChatflowActivities(limit, offset),
                this.getExecutionActivities(limit, offset),
                this.getCustomerActivities(limit, offset)
            ])

            // Combine and sort activities
            let allActivities = [
                ...chatflowActivities,
                ...executionActivities,
                ...customerActivities
            ]

            // Filter by type if specified
            if (type) {
                allActivities = allActivities.filter(activity => activity.type === type)
            }

            // Filter by date range if specified
            if (startDate && endDate) {
                const start = new Date(startDate)
                const end = new Date(endDate)
                allActivities = allActivities.filter(activity => {
                    const activityDate = new Date(activity.timestamp)
                    return activityDate >= start && activityDate <= end
                })
            }

            // Sort by timestamp (newest first)
            allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

            // Apply pagination
            const total = allActivities.length
            const activities = allActivities.slice(offset, offset + limit)

            return { activities, total }
        } catch (error) {
            logger.error('Error in getActivityTimeline:', error)
            throw error
        }
    }

    /**
     * Get recent activities (last 24 hours)
     */
    async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
            
            const { activities } = await this.getActivityTimeline({
                limit,
                startDate: twentyFourHoursAgo.toISOString()
            })

            return activities
        } catch (error) {
            logger.error('Error in getRecentActivity:', error)
            throw error
        }
    }

    /**
     * Get analytics data
     */
    async getAnalytics(period: string = '7d', metrics: string = 'all'): Promise<AnalyticsData> {
        try {
            const endDate = new Date()
            const startDate = this.getStartDateFromPeriod(period)

            const [executions, users, chatflows, customers, revenue] = await Promise.all([
                this.getExecutionsByPeriod(startDate, endDate),
                this.getUsersByPeriod(startDate, endDate),
                this.getChatflowsByPeriod(startDate, endDate),
                this.getCustomersByPeriod(startDate, endDate),
                this.getRevenueByPeriod(startDate, endDate)
            ])

            const trends = await this.getTrendsByPeriod(startDate, endDate)

            return {
                period,
                metrics: {
                    executions,
                    users,
                    chatflows,
                    customers,
                    revenue
                },
                trends
            }
        } catch (error) {
            logger.error('Error in getAnalytics:', error)
            throw error
        }
    }

    /**
     * Get trends data
     */
    async getTrends(period: string = '30d', metric: string = 'executions') {
        try {
            const endDate = new Date()
            const startDate = this.getStartDateFromPeriod(period)
            
            return await this.getTrendsByPeriod(startDate, endDate, metric)
        } catch (error) {
            logger.error('Error in getTrends:', error)
            throw error
        }
    }

    /**
     * Get comparison data between two periods
     */
    async getComparisonData(currentPeriod: string, previousPeriod: string, metrics: string = 'all') {
        try {
            const currentEndDate = new Date()
            const currentStartDate = this.getStartDateFromPeriod(currentPeriod)
            
            const previousEndDate = new Date(currentStartDate)
            const previousStartDate = this.getStartDateFromPeriod(previousPeriod)

            const [currentData, previousData] = await Promise.all([
                this.getAnalytics(currentPeriod, metrics),
                this.getAnalytics(previousPeriod, metrics)
            ])

            return {
                current: currentData,
                previous: previousData,
                changes: this.calculateChanges(currentData.metrics, previousData.metrics)
            }
        } catch (error) {
            logger.error('Error in getComparisonData:', error)
            throw error
        }
    }

    // Helper methods
    private async getActiveUsersCount(): Promise<number> {
        try {
            const result = await supabaseDBService.getActiveUsersCount()
            return result
        } catch (error) {
            logger.error('Error getting active users count:', error)
            return 0
        }
    }

    private async getAverageResponseTime(): Promise<number> {
        // Mock implementation - should be calculated from actual execution data
        return 1.2 // seconds
    }

    private async calculateRevenue(): Promise<number> {
        // Mock implementation - should be calculated from actual billing data
        return 12500.00
    }

    private async calculateCustomerRetention(): Promise<number> {
        // Mock implementation - should be calculated from actual customer data
        return 85.5 // percentage
    }

    private async calculateGrowthRate(): Promise<number> {
        // Mock implementation - should be calculated from actual growth data
        return 12.3 // percentage
    }

    private async calculateConversionRate(): Promise<number> {
        // Mock implementation - should be calculated from actual conversion data
        return 3.2 // percentage
    }

    private async getChatflowActivities(limit: number, offset: number): Promise<ActivityItem[]> {
        // Mock implementation - should query actual chatflow activities
        return []
    }

    private async getExecutionActivities(limit: number, offset: number): Promise<ActivityItem[]> {
        // Mock implementation - should query actual execution activities
        return []
    }

    private async getCustomerActivities(limit: number, offset: number): Promise<ActivityItem[]> {
        // Mock implementation - should query actual customer activities
        return []
    }

    private getStartDateFromPeriod(period: string): Date {
        const now = new Date()
        switch (period) {
            case '1d':
                return new Date(now.getTime() - 24 * 60 * 60 * 1000)
            case '7d':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            case '30d':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            case '90d':
                return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            case '1y':
                return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            default:
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
    }

    private async getExecutionsByPeriod(startDate: Date, endDate: Date): Promise<number> {
        try {
            const AppDataSource = getDataSource()
            return await AppDataSource.getRepository(Execution).count({
                where: {
                    createdDate: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            })
        } catch (error) {
            logger.error('Error getting executions by period:', error)
            return 0
        }
    }

    private async getUsersByPeriod(startDate: Date, endDate: Date): Promise<number> {
        try {
            return await supabaseDBService.getUsersByPeriod(startDate, endDate)
        } catch (error) {
            logger.error('Error getting users by period:', error)
            return 0
        }
    }

    private async getChatflowsByPeriod(startDate: Date, endDate: Date): Promise<number> {
        try {
            const AppDataSource = getDataSource()
            return await AppDataSource.getRepository(Chatflow).count({
                where: {
                    createdDate: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            })
        } catch (error) {
            logger.error('Error getting chatflows by period:', error)
            return 0
        }
    }

    private async getCustomersByPeriod(startDate: Date, endDate: Date): Promise<number> {
        try {
            return await supabaseDBService.getCustomersByPeriod(startDate, endDate)
        } catch (error) {
            logger.error('Error getting customers by period:', error)
            return 0
        }
    }

    private async getRevenueByPeriod(startDate: Date, endDate: Date): Promise<number> {
        // Mock implementation
        return 2500.00
    }

    private async getTrendsByPeriod(startDate: Date, endDate: Date, metric: string = 'all') {
        // Mock implementation - should return actual trend data
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const trends = []
        
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
            trends.push({
                date: date.toISOString().split('T')[0],
                executions: Math.floor(Math.random() * 100) + 50,
                users: Math.floor(Math.random() * 20) + 10,
                revenue: Math.floor(Math.random() * 500) + 200
            })
        }
        
        return trends
    }

    private calculateChanges(current: any, previous: any) {
        const changes: any = {}
        
        Object.keys(current).forEach(key => {
            if (typeof current[key] === 'number' && typeof previous[key] === 'number') {
                const change = ((current[key] - previous[key]) / previous[key]) * 100
                changes[key] = {
                    value: current[key] - previous[key],
                    percentage: Math.round(change * 100) / 100
                }
            }
        })
        
        return changes
    }
}

export const dashboardService = new DashboardService()