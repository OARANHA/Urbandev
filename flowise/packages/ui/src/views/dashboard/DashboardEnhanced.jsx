import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

// material-ui
import {
    Grid,
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Button,
    LinearProgress,
    Alert,
    Chip,
    useTheme,
    IconButton,
    Tooltip,
    Tabs,
    Tab,
    Paper
} from '@mui/material'
import {
    IconChartLine,
    IconUsers,
    IconRobot,
    IconDatabase,
    IconSettings,
    IconRefresh,
    IconTrendingUp,
    IconTrendingDown,
    IconClock,
    IconActivity,
    IconGridDots,
    IconPlus,
    IconDownload
} from '@tabler/icons-react'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { gridSpacing } from '@/store/constant'

// Hooks
import useApi from '@/hooks/useApi'

// API
import { dashboardApi } from '@/api/dashboard'

// Chart Components (will be imported when recharts is available)
// import CustomLineChart from '@/ui-component/charts/LineChart'
// import CustomBarChart from '@/ui-component/charts/BarChart'
// import CustomPieChart from '@/ui-component/charts/PieChart'
// import CustomAreaChart from '@/ui-component/charts/AreaChart'
// import StatCard from '@/ui-component/charts/StatCard'
// import DashboardGrid from '@/ui-component/charts/DashboardGrid'

// ==============================|| ENHANCED DASHBOARD PAGE ||============================== //

const DashboardEnhanced = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    
    // Estados
    const [stats, setStats] = useState({
        overview: {
            totalChatflows: 0,
            totalAssistants: 0,
            totalExecutions: 0,
            totalCustomers: 0,
            activeUsers: 0
        },
        performance: {
            successRate: 0,
            averageResponseTime: 0,
            errorRate: 0,
            uptime: 0
        },
        business: {
            revenue: 0,
            customerRetention: 0,
            growthRate: 0,
            conversionRate: 0
        }
    })
    
    const [recentActivity, setRecentActivity] = useState([])
    const [analytics, setAnalytics] = useState(null)
    const [trends, setTrends] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [activeTab, setActiveTab] = useState(0)
    
    // APIs
    const getDashboardStatsApi = useApi(dashboardApi.getDashboardStats)
    const getRecentActivityApi = useApi(dashboardApi.getRecentActivity)
    const getAnalyticsApi = useApi(dashboardApi.getAnalytics)
    const getTrendsApi = useApi(dashboardApi.getTrends)
    
    const loadDashboardData = async () => {
        try {
            setRefreshing(true)
            
            // Carregar dados em paralelo
            const [dashboardStats, activities, analyticsData, trendsData] = await Promise.all([
                getDashboardStatsApi.request(),
                getRecentActivityApi.request(10),
                getAnalyticsApi.request('7d'),
                getTrendsApi.request('7d', 'executions')
            ])
            
            // Atualizar estatísticas
            if (dashboardStats?.data) {
                setStats(dashboardStats.data)
            }
            
            // Atualizar atividades recentes
            if (activities?.data?.activities) {
                const formattedActivities = activities.data.activities.map(activity => ({
                    id: activity.id,
                    type: activity.type,
                    name: activity.description,
                    time: dashboardApi.formatDateTime(activity.timestamp),
                    status: activity.action === 'executed' ? 'success' : 
                           activity.action === 'created' ? 'success' :
                           activity.action === 'updated' ? 'info' :
                           activity.action === 'deleted' ? 'error' : 'default',
                    user: activity.user,
                    metadata: activity.metadata
                }))
                setRecentActivity(formattedActivities)
            }
            
            // Atualizar analytics
            if (analyticsData?.data) {
                setAnalytics(analyticsData.data)
            }
            
            // Atualizar tendências
            if (trendsData?.data) {
                setTrends(trendsData.data)
            }
            
            setLoading(false)
            setRefreshing(false)
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error)
            setLoading(false)
            setRefreshing(false)
        }
    }
    
    useEffect(() => {
        loadDashboardData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    
    // Enhanced Stat Card Component
    const EnhancedStatCard = ({ title, value, icon, color, trend, trendValue, sparklineData, formatType = 'number' }) => {
        const formatValue = (val) => {
            switch (formatType) {
                case 'currency':
                    return new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(val)
                case 'percentage':
                    return `${val}%`
                default:
                    return val.toLocaleString('pt-BR')
            }
        }
        
        return (
            <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h4" color="textSecondary" gutterBottom sx={{ fontWeight: 500 }}>
                                {title}
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 700, color: color || theme.palette.primary.main, mb: 1 }}>
                                {formatValue(value)}
                            </Typography>
                            {trend && (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    {trend === 'up' ? (
                                        <IconTrendingUp size={16} color={theme.palette.success.main} />
                                    ) : trend === 'down' ? (
                                        <IconTrendingDown size={16} color={theme.palette.error.main} />
                                    ) : (
                                        <IconTrendingUp size={16} color={theme.palette.warning.main} />
                                    )}
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            fontWeight: 600,
                                            color: trend === 'up' ? 'success.main' : 
                                                   trend === 'down' ? 'error.main' : 'warning.main'
                                        }}
                                    >
                                        {trendValue}
                                    </Typography>
                                </Stack>
                            )}
                        </Box>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: (color || theme.palette.primary.main) + '15',
                                color: color || theme.palette.primary.main,
                                fontSize: 24
                            }}
                        >
                            {icon}
                        </Box>
                    </Stack>
                    
                    {/* Sparkline Chart */}
                    {sparklineData && sparklineData.length > 0 && (
                        <Box sx={{ mt: 2, height: 40 }}>
                            <svg width="100%" height="40" viewBox={`0 0 ${sparklineData.length * 10} 40`}>
                                <polyline
                                    fill="none"
                                    stroke={(color || theme.palette.primary.main) + '40'}
                                    strokeWidth="2"
                                    points={sparklineData.map((point, index) => `${index * 10},${40 - (point.value / Math.max(...sparklineData.map(p => p.value))) * 30}`).join(' ')}
                                />
                            </svg>
                        </Box>
                    )}
                </CardContent>
            </Card>
        )
    }
    
    // Activity Item Component
    const ActivityItem = ({ item }) => {
        const getStatusColor = (status) => {
            switch (status) {
                case 'success': return 'success'
                case 'error': return 'error'
                case 'info': return 'info'
                default: return 'default'
            }
        }
        
        const getStatusIcon = (type) => {
            const icon = dashboardApi.getActivityIcon(type)
            return <span style={{ fontSize: '16px' }}>{icon}</span>
        }
        
        return (
            <Paper sx={{ p: 2, mb: 1, backgroundColor: theme.palette.background.paper }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ color: theme.palette.text.secondary }}>
                        {getStatusIcon(item.type)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {item.time}
                        </Typography>
                    </Box>
                    <Chip 
                        label={item.status} 
                        size="small" 
                        color={getStatusColor(item.status)}
                        sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                    />
                </Stack>
            </Paper>
        )
    }
    
    // Chart Placeholder Component (until recharts is installed)
    const ChartPlaceholder = ({ title, type, height = 300 }) => (
        <Card sx={{ height }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
                <Box 
                    sx={{ 
                        flex: 1,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: theme.palette.grey[50],
                        borderRadius: 2,
                        border: `2px dashed ${theme.palette.divider}`,
                        flexDirection: 'column',
                        gap: 2
                    }}
                >
                    <IconChartLine size={48} color={theme.palette.text.secondary} />
                    <Typography variant="h6" color="textSecondary">
                        Gráfico {type}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center">
                        Aguardando instalação do Recharts<br/>
                        para renderizar gráficos interativos
                    </Typography>
                    <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => console.log('Install recharts')}
                    >
                        Instalar Recharts
                    </Button>
                </Box>
            </CardContent>
        </Card>
    )
    
    // Tab Panel Component
    const TabPanel = ({ children, value, index, ...other }) => (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`dashboard-tabpanel-${index}`}
            aria-labelledby={`dashboard-tab-${index}`}
            {...other}
        >
            {value === index && children}
        </div>
    )
    
    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <LinearProgress />
            </Box>
        )
    }
    
    return (
        <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                            Dashboard UrbanDev
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Visão geral da sua plataforma de desenvolvimento inteligente
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <IconButton 
                            onClick={loadDashboardData}
                            disabled={refreshing}
                            sx={{ 
                                backgroundColor: theme.palette.primary.main + '10',
                                '&:hover': { backgroundColor: theme.palette.primary.main + '20' }
                            }}
                        >
                            <IconRefresh />
                        </IconButton>
                        <IconButton 
                            sx={{ 
                                backgroundColor: theme.palette.secondary.main + '10',
                                '&:hover': { backgroundColor: theme.palette.secondary.main + '20' }
                            }}
                        >
                            <IconDownload />
                        </IconButton>
                        <IconButton 
                            sx={{ 
                                backgroundColor: theme.palette.info.main + '10',
                                '&:hover': { backgroundColor: theme.palette.info.main + '20' }
                            }}
                        >
                            <IconGridDots />
                        </IconButton>
                    </Stack>
                </Stack>
                
                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab label="Visão Geral" id="dashboard-tab-0" />
                        <Tab label="Analytics" id="dashboard-tab-1" />
                        <Tab label="Relatórios" id="dashboard-tab-2" />
                    </Tabs>
                </Box>
                
                {/* Tab Panels */}
                <TabPanel value={activeTab} index={0}>
                    <Stack spacing={3}>
                        {/* Stats Cards */}
                        <Grid container spacing={gridSpacing}>
                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                <EnhancedStatCard
                                    title="Total Chatflows"
                                    value={stats.overview.totalChatflows}
                                    icon="🤖"
                                    color={theme.palette.primary.main}
                                    trend="up"
                                    trendValue="+12%"
                                    formatType="number"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                <EnhancedStatCard
                                    title="Assistentes"
                                    value={stats.overview.totalAssistants}
                                    icon="🔧"
                                    color={theme.palette.secondary.main}
                                    trend="up"
                                    trendValue="+8%"
                                    formatType="number"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                <EnhancedStatCard
                                    title="Execuções"
                                    value={stats.overview.totalExecutions}
                                    icon="📊"
                                    color={theme.palette.success.main}
                                    trend="up"
                                    trendValue="+25%"
                                    formatType="number"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                <EnhancedStatCard
                                    title="Clientes"
                                    value={stats.overview.totalCustomers}
                                    icon="👥"
                                    color={theme.palette.info.main}
                                    trend="up"
                                    trendValue="+15%"
                                    formatType="number"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                <EnhancedStatCard
                                    title="Usuários Ativos"
                                    value={stats.overview.activeUsers}
                                    icon="👤"
                                    color={theme.palette.warning.main}
                                    trend="up"
                                    trendValue="+5%"
                                    formatType="number"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                <EnhancedStatCard
                                    title="Taxa de Sucesso"
                                    value={stats.performance.successRate}
                                    icon="✅"
                                    color={theme.palette.success.main}
                                    trend={stats.performance.successRate > 95 ? 'up' : 'stable'}
                                    trendValue={stats.performance.successRate > 95 ? '+2%' : '0%'}
                                    formatType="percentage"
                                />
                            </Grid>
                        </Grid>
                        
                        {/* Charts and Activity */}
                        <Grid container spacing={gridSpacing}>
                            <Grid item xs={12} md={8}>
                                <ChartPlaceholder
                                    title="Tendências de Execução"
                                    type="de Linhas"
                                    height={400}
                                />
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <Card sx={{ height: 400 }}>
                                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                            Atividade Recente
                                        </Typography>
                                        <Box sx={{ flex: 1, overflowY: 'auto' }}>
                                            <Stack spacing={1}>
                                                {recentActivity.slice(0, 8).map((item) => (
                                                    <ActivityItem key={item.id} item={item} />
                                                ))}
                                            </Stack>
                                        </Box>
                                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                fullWidth
                                                onClick={() => console.log('Ver todas as atividades')}
                                            >
                                                Ver todas as atividades
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        
                        {/* Additional Charts */}
                        <Grid container spacing={gridSpacing}>
                            <Grid item xs={12} md={6}>
                                <ChartPlaceholder
                                    title="Distribuição de Chatflows"
                                    type="de Pizza"
                                    height={300}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <ChartPlaceholder
                                    title="Performance por Tipo"
                                    type="de Barras"
                                    height={300}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                </TabPanel>
                
                <TabPanel value={activeTab} index={1}>
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12} md={8}>
                            <ChartPlaceholder
                                title="Análise de Tendências"
                                type="de Área"
                                height={400}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <ChartPlaceholder
                                title="Métricas de Negócio"
                                type="Misto"
                                height={400}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <ChartPlaceholder
                                title="Comparação de Períodos"
                                type="Comparativo"
                                height={300}
                            />
                        </Grid>
                    </Grid>
                </TabPanel>
                
                <TabPanel value={activeTab} index={2}>
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Relatórios Disponíveis
                                    </Typography>
                                    <Stack spacing={2}>
                                        <Button variant="outlined" fullWidth startIcon={<IconDownload />}>
                                            Relatório de Execuções
                                        </Button>
                                        <Button variant="outlined" fullWidth startIcon={<IconDownload />}>
                                            Relatório de Usuários
                                        </Button>
                                        <Button variant="outlined" fullWidth startIcon={<IconDownload />}>
                                            Relatório de Performance
                                        </Button>
                                        <Button variant="outlined" fullWidth startIcon={<IconDownload />}>
                                            Relatório de Negócios
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Configurações de Relatórios
                                    </Typography>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Configure relatórios automáticos e exportações
                                    </Alert>
                                    <Button variant="contained" fullWidth startIcon={<IconSettings />}>
                                        Configurar Relatórios
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </TabPanel>
            </Stack>
        </Box>
    )
}

export default DashboardEnhanced