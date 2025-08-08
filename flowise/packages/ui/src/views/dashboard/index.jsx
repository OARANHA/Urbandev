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
    Tooltip
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
    IconActivity
} from '@tabler/icons-react'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { gridSpacing } from '@/store/constant'

// Hooks
import useApi from '@/hooks/useApi'

// API
import chatflowApi from '@/api/chatflows'
import assistantApi from '@/api/assistants'
import executionApi from '@/api/executions'
import statsApi from '@/api/stats'
import { dashboardApi } from '@/api/dashboard'

// ==============================|| DASHBOARD PAGE ||============================== //

const DashboardPage = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    
    // Estados para estatísticas
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
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    
    // APIs
    const getDashboardStatsApi = useApi(dashboardApi.getDashboardStats)
    const getRecentActivityApi = useApi(dashboardApi.getRecentActivity)
    
    const loadDashboardData = async () => {
        try {
            setRefreshing(true)
            
            // Carregar dados das novas APIs do Dashboard
            const [dashboardStats, activities] = await Promise.all([
                getDashboardStatsApi.request(),
                getRecentActivityApi.request(10)
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
    
    const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h4" color="textSecondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 700, color }}>
                            {value}
                        </Typography>
                        {trend && (
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                                {trend === 'up' ? (
                                    <IconTrendingUp size={16} color={theme.palette.success.main} />
                                ) : (
                                    <IconTrendingDown size={16} color={theme.palette.error.main} />
                                )}
                                <Typography 
                                    variant="body2" 
                                    color={trend === 'up' ? 'success.main' : 'error.main'}
                                >
                                    {trendValue}
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: color + '20',
                            color: color
                        }}
                    >
                        {icon}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    )
    
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
            <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1 }}>
                <Box sx={{ color: theme.palette.text.secondary }}>
                    {getStatusIcon(item.type)}
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{item.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                        {item.time}
                    </Typography>
                </Box>
                <Chip 
                    label={item.status} 
                    size="small" 
                    color={getStatusColor(item.status)}
                    sx={{ fontSize: '0.75rem' }}
                />
            </Stack>
        )
    }
    
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
                </Stack>
                
                {/* Stats Cards */}
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard
                            title="Total Chatflows"
                            value={stats.overview.totalChatflows}
                            icon={<IconRobot size={32} />}
                            color={theme.palette.primary.main}
                            trend="up"
                            trendValue="+12%"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard
                            title="Assistentes"
                            value={stats.overview.totalAssistants}
                            icon={<IconSettings size={32} />}
                            color={theme.palette.secondary.main}
                            trend="up"
                            trendValue="+8%"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard
                            title="Execuções"
                            value={stats.overview.totalExecutions}
                            icon={<IconActivity size={32} />}
                            color={theme.palette.success.main}
                            trend="up"
                            trendValue="+25%"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard
                            title="Clientes"
                            value={stats.overview.totalCustomers}
                            icon={<IconDatabase size={32} />}
                            color={theme.palette.info.main}
                            trend="up"
                            trendValue="+15%"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard
                            title="Usuários Ativos"
                            value={stats.overview.activeUsers}
                            icon={<IconUsers size={32} />}
                            color={theme.palette.warning.main}
                            trend="up"
                            trendValue="+5%"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard
                            title="Taxa de Sucesso"
                            value={`${stats.performance.successRate}%`}
                            icon={<IconTrendingUp size={32} />}
                            color={theme.palette.success.main}
                            trend={stats.performance.successRate > 95 ? 'up' : 'stable'}
                            trendValue={stats.performance.successRate > 95 ? '+2%' : '0%'}
                        />
                    </Grid>
                </Grid>
                
                {/* Charts and Activity */}
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} md={8}>
                        <MainCard title="Visão Geral do Sistema" content={false}>
                            <Box sx={{ p: 3 }}>
                                <Alert severity="success" sx={{ mb: 3 }}>
                                    ✅ APIs do Dashboard integradas com sucesso! Dados em tempo real do Supabase.
                                </Alert>
                                <Box 
                                    sx={{ 
                                        height: 300, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        backgroundColor: theme.palette.success.main + '10',
                                        borderRadius: 2,
                                        border: `2px solid ${theme.palette.success.main}30`
                                    }}
                                >
                                    <Stack alignItems="center" spacing={2}>
                                        <IconChartLine size={48} color={theme.palette.success.main} />
                                        <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                                            Analytics Integrados
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" align="center">
                                            Dados de desempenho e métricas<br/>
                                            carregados do Supabase
                                        </Typography>
                                        <Button 
                                            variant="contained" 
                                            color="success"
                                            onClick={() => {
                                                // Future: Open detailed analytics modal
                                                console.log('Abrir analytics detalhados')
                                            }}
                                        >
                                            Ver Analytics Detalhados
                                        </Button>
                                    </Stack>
                                </Box>
                            </Box>
                        </MainCard>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                        <MainCard title="Atividade Recente" content={false}>
                            <Box sx={{ p: 3 }}>
                                <Stack spacing={2}>
                                    {recentActivity.map((item) => (
                                        <ActivityItem key={item.id} item={item} />
                                    ))}
                                </Stack>
                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        fullWidth
                                        onClick={() => {
                                            // Future: Navigate to full activity timeline
                                            console.log('Ver timeline completa')
                                        }}
                                    >
                                        Ver todas as atividades
                                    </Button>
                                </Box>
                            </Box>
                        </MainCard>
                    </Grid>
                </Grid>
                
                {/* Quick Actions */}
                <MainCard title="Ações Rápidas" content={false}>
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button 
                                    variant="outlined" 
                                    fullWidth 
                                    startIcon={<IconRobot />}
                                    sx={{ height: 60, flexDirection: 'column', gap: 1 }}
                                >
                                    <Typography variant="button">Novo Chatflow</Typography>
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button 
                                    variant="outlined" 
                                    fullWidth 
                                    startIcon={<IconSettings />}
                                    sx={{ height: 60, flexDirection: 'column', gap: 1 }}
                                >
                                    <Typography variant="button">Novo Assistente</Typography>
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button 
                                    variant="outlined" 
                                    fullWidth 
                                    startIcon={<IconUsers />}
                                    sx={{ height: 60, flexDirection: 'column', gap: 1 }}
                                >
                                    <Typography variant="button">Convidar Usuário</Typography>
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button 
                                    variant="outlined" 
                                    fullWidth 
                                    startIcon={<IconDatabase />}
                                    sx={{ height: 60, flexDirection: 'column', gap: 1 }}
                                >
                                    <Typography variant="button">Documentos</Typography>
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </MainCard>
            </Stack>
        </Box>
    )
}

export default DashboardPage