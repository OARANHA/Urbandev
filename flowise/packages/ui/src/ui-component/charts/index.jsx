// Main Chart Components
export { default as LineChart } from './LineChart'
export { default as BarChart } from './BarChart'
export { default as PieChart } from './PieChart'
export { default as AreaChart } from './AreaChart'
export { default as StatCard, EnhancedStatCard } from './StatCard'
export { default as DashboardGrid, WIDGET_TYPES, DEFAULT_WIDGETS } from './DashboardGrid'

// Chart Utilities
export const ChartUtils = {
    // Color palettes
    colors: {
        primary: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'],
        success: ['#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107'],
        warning: ['#ff9800', '#ff5722', '#f44336', '#e91e63', '#9c27b0'],
        info: ['#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a']
    },
    
    // Formatters
    formatters: {
        number: (value) => new Intl.NumberFormat('pt-BR').format(value),
        currency: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
        percentage: (value) => `${value.toFixed(1)}%`,
        date: (date) => new Date(date).toLocaleDateString('pt-BR'),
        dateTime: (date) => new Date(date).toLocaleString('pt-BR')
    },
    
    // Generate mock data for charts
    generateMockData: (type = 'line', days = 30) => {
        const data = []
        const now = new Date()
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            const baseValue = Math.random() * 100 + 50
            
            switch (type) {
                case 'line':
                    data.push({
                        date: date.toISOString().split('T')[0],
                        value: Math.round(baseValue + Math.random() * 20 - 10),
                        users: Math.round(baseValue * 0.3 + Math.random() * 10 - 5),
                        revenue: Math.round(baseValue * 2.5 + Math.random() * 50 - 25)
                    })
                    break
                case 'bar':
                    data.push({
                        name: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
                        value: Math.round(baseValue + Math.random() * 30 - 15)
                    })
                    break
                case 'pie':
                    // For pie charts, we return categories
                    return [
                        { name: 'Chatflows', value: Math.round(Math.random() * 100 + 50) },
                        { name: 'Assistants', value: Math.round(Math.random() * 80 + 30) },
                        { name: 'Execuções', value: Math.round(Math.random() * 200 + 100) },
                        { name: 'Usuários', value: Math.round(Math.random() * 60 + 20) }
                    ]
                default:
                    data.push({
                        date: date.toISOString().split('T')[0],
                        value: Math.round(baseValue)
                    })
            }
        }
        
        return data
    },
    
    // Calculate trend percentage
    calculateTrend: (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return ((current - previous) / previous) * 100
    },
    
    // Generate sparkline data
    generateSparkline: (baseValue = 50, points = 20) => {
        const data = []
        for (let i = 0; i < points; i++) {
            data.push({
                value: Math.round(baseValue + Math.random() * 20 - 10)
            })
        }
        return data
    }
}

// Chart configuration presets
export const ChartPresets = {
    // Line chart presets
    lineChart: {
        trends: {
            height: 300,
            lines: [
                { dataKey: 'executions', name: 'Execuções', color: '#8884d8', strokeWidth: 2 },
                { dataKey: 'users', name: 'Usuários', color: '#82ca9d', strokeWidth: 2 }
            ],
            showGrid: true,
            showLegend: true,
            showTooltip: true
        },
        performance: {
            height: 250,
            lines: [
                { dataKey: 'successRate', name: 'Taxa de Sucesso', color: '#4caf50', strokeWidth: 3 },
                { dataKey: 'responseTime', name: 'Tempo de Resposta', color: '#ff9800', strokeWidth: 2 }
            ],
            showGrid: true,
            showLegend: true,
            showTooltip: true
        }
    },
    
    // Bar chart presets
    barChart: {
        comparison: {
            height: 300,
            bars: [
                { dataKey: 'current', name: 'Atual', color: '#8884d8' },
                { dataKey: 'previous', name: 'Anterior', color: '#82ca9d' }
            ],
            layout: 'horizontal',
            showGrid: true,
            showLegend: true
        },
        distribution: {
            height: 300,
            bars: [
                { dataKey: 'value', name: 'Quantidade', color: '#8884d8' }
            ],
            layout: 'vertical',
            showGrid: true,
            showLegend: false
        }
    },
    
    // Pie chart presets
    pieChart: {
        distribution: {
            height: 300,
            innerRadius: 0,
            outerRadius: 80,
            showLegend: true,
            showTooltip: true
        },
        donut: {
            height: 300,
            innerRadius: 60,
            outerRadius: 80,
            showLegend: true,
            showTooltip: true
        }
    },
    
    // Area chart presets
    areaChart: {
        stacked: {
            height: 300,
            areas: [
                { dataKey: 'executions', name: 'Execuções', color: '#8884d8', opacity: 0.6 },
                { dataKey: 'users', name: 'Usuários', color: '#82ca9d', opacity: 0.6 }
            ],
            stacked: true,
            showGrid: true,
            showLegend: true
        },
        overlap: {
            height: 300,
            areas: [
                { dataKey: 'revenue', name: 'Receita', color: '#8884d8', opacity: 0.8 },
                { dataKey: 'costs', name: 'Custos', color: '#ff7300', opacity: 0.6 }
            ],
            stacked: false,
            showGrid: true,
            showLegend: true
        }
    }
}

// Default export for convenience
export default {
    LineChart: () => import('./LineChart'),
    BarChart: () => import('./BarChart'),
    PieChart: () => import('./PieChart'),
    AreaChart: () => import('./AreaChart'),
    StatCard: () => import('./StatCard'),
    DashboardGrid: () => import('./DashboardGrid'),
    ChartUtils,
    ChartPresets
}