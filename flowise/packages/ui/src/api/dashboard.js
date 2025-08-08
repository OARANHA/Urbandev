import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1'

// Dashboard API Service
class DashboardApi {
    constructor() {
        this.api = axios.create({
            baseURL: `${API_BASE_URL}/dashboard`,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        // Add request interceptor for authentication
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token')
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
                }
                return config
            },
            (error) => {
                return Promise.reject(error)
            }
        )

        // Add response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Redirect to login if unauthorized
                    window.location.href = '/signin'
                }
                return Promise.reject(error)
            }
        )
    }

    // Dashboard Statistics
    async getDashboardStats() {
        try {
            const response = await this.api.get('/stats')
            return response.data.data
        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
            throw error
        }
    }

    async getOverviewStats() {
        try {
            const response = await this.api.get('/stats/overview')
            return response.data.data
        } catch (error) {
            console.error('Error fetching overview stats:', error)
            throw error
        }
    }

    async getPerformanceStats() {
        try {
            const response = await this.api.get('/stats/performance')
            return response.data.data
        } catch (error) {
            console.error('Error fetching performance stats:', error)
            throw error
        }
    }

    // Activity Timeline
    async getActivityTimeline(filters = {}) {
        try {
            const params = new URLSearchParams()
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null) {
                    params.append(key, filters[key])
                }
            })

            const response = await this.api.get(`/activity?${params.toString()}`)
            return response.data.data
        } catch (error) {
            console.error('Error fetching activity timeline:', error)
            throw error
        }
    }

    async getRecentActivity(limit = 10) {
        try {
            const response = await this.api.get(`/activity/recent?limit=${limit}`)
            return response.data.data
        } catch (error) {
            console.error('Error fetching recent activity:', error)
            throw error
        }
    }

    // Analytics
    async getAnalytics(period = '7d', metrics = 'all') {
        try {
            const response = await this.api.get(`/analytics?period=${period}&metrics=${metrics}`)
            return response.data.data
        } catch (error) {
            console.error('Error fetching analytics:', error)
            throw error
        }
    }

    async getTrends(period = '30d', metric = 'executions') {
        try {
            const response = await this.api.get(`/analytics/trends?period=${period}&metric=${metric}`)
            return response.data.data
        } catch (error) {
            console.error('Error fetching trends:', error)
            throw error
        }
    }

    async getComparisonData(currentPeriod, previousPeriod, metrics = 'all') {
        try {
            const params = new URLSearchParams({
                currentPeriod,
                previousPeriod,
                metrics
            })
            const response = await this.api.get(`/analytics/comparison?${params.toString()}`)
            return response.data.data
        } catch (error) {
            console.error('Error fetching comparison data:', error)
            throw error
        }
    }

    // Utility methods for data formatting
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M'
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K'
        }
        return num.toString()
    }

    formatPercentage(value) {
        return `${value.toFixed(1)}%`
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount)
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Data aggregation helpers
    aggregateTrendsByPeriod(trends, period = 'daily') {
        const aggregated = {}
        
        trends.forEach(item => {
            const date = new Date(item.date)
            let key
            
            switch (period) {
                case 'weekly':
                    const weekStart = new Date(date)
                    weekStart.setDate(date.getDate() - date.getDay())
                    key = weekStart.toISOString().split('T')[0]
                    break
                case 'monthly':
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                    break
                default:
                    key = item.date
            }
            
            if (!aggregated[key]) {
                aggregated[key] = {
                    date: key,
                    executions: 0,
                    users: 0,
                    revenue: 0
                }
            }
            
            aggregated[key].executions += item.executions || 0
            aggregated[key].users += item.users || 0
            aggregated[key].revenue += item.revenue || 0
        })
        
        return Object.values(aggregated).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }

    calculateGrowthRate(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0
        return ((current - previous) / previous) * 100
    }

    getActivityIcon(type) {
        const icons = {
            chatflow: '🔄',
            execution: '▶️',
            customer: '👥',
            assistant: '🤖',
            user: '👤'
        }
        return icons[type] || '📝'
    }

    getActivityColor(type) {
        const colors = {
            chatflow: 'primary',
            execution: 'success',
            customer: 'info',
            assistant: 'warning',
            user: 'secondary'
        }
        return colors[type] || 'default'
    }
}

// Export singleton instance
export const dashboardApi = new DashboardApi()

// Export class for custom instances if needed
export default DashboardApi