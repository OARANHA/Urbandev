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

// ==============================|| DASHBOARD PAGE ||============================== //

const DashboardPage = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    
    // Estados para estatísticas
    const [stats, setStats] = useState({
        totalChatflows: 0,
        totalAssistants: 0,
        totalExecutions: 0,
        activeUsers: 0,
        executionRate: 0,
        successRate: 0
    })
    
    const [recentActivity, setRecentActivity] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    
    // APIs
    const getChatflowsApi = useApi(chatflowApi.getAllChatflows)
    const getAssistantsApi = useApi(assistantApi.getAllAssistants)
    const getExecutionsApi = useApi(executionApi.getAllExecutions)
    const getStatsApi = useApi(statsApi.getStats)
    
    const loadDashboardData = async () => {
        try {
            setRefreshing(true)
            
            // Carregar dados em paralelo
            const [chatflowsData, assistantsData, executionsData, statsData] = await Promise.all([
                getChatflowsApi.request({}),
                getAssistantsApi.request({}),
                getExecutionsApi.request({ page: 1, pageSize: 1 }),
                getStatsApi.request({})
            ])
            
            // Processar estatísticas
            const totalChatflows = chatflowsData?.data?.total || 0
            const totalAssistants = assistantsData?.data?.total || 0
            const totalExecutions = executionsData?.data?.total || 0
            
            // Calcular taxas (simuladas para demonstração)
            const executionRate = Math.min(100, Math.round((totalExecutions / Math.max(1, totalChatflows)) * 10))
            const successRate = Math.floor(Math.random() * 30) + 70 // 70-100%
            
            setStats({
                totalChatflows,
                totalAssistants,
                totalExecutions,
                activeUsers: Math.floor(Math.random() * 50) + 10, // Simulado
                executionRate,
                successRate
            })
            
            // Simular atividades recentes
            setRecentActivity([
                { id: 1, type: 'chatflow', name: 'Novo chatbot criado', time: '2 min atrás', status: 'success' },
                { id: 2, type: 'execution', name: 'Execução de fluxo', time: '5 min atrás', status: 'success' },
                { id: 3, type: 'assistant', name: 'Assistente atualizado', time: '10 min atrás', status: 'info' },
                { id: 4, type: 'user', name: 'Novo usuário registrado', time: '15 min atrás', status: 'success' },
                { id: 5, type: 'execution', name: 'Falha na execução', time: '20 min atrás', status: 'error' }
            ])
            
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
            switch (type) {
                case 'chatflow': return <IconRobot size={16} />
                case 'execution': return <IconActivity size={16} />
                case 'assistant': return <IconSettings size={16} />
                case 'user': return <IconUsers size={16} />
                default: return <IconClock size={16} />
            }
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
                            value={stats.totalChatflows}
                            icon={<IconRobot size={32} />}
                            color={theme.palette.primary.main}
                            trend="up"
                            trendValue="+12%"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard
                            title="Assistentes"
                            value={stats.totalAssistants}
                            icon={<IconSettings size={32} />}
                            color={theme.palette.secondary.main}
                            trend="up"
                            trendValue="+8%"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard
                            title="Execuções"
                            value={stats.totalExecutions}
                            icon={<IconActivity size={32} />}
                            color={theme.palette.success.main}
                            trend="up"
                            trendValue="+25%"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard
                            title="Usuários Ativos"
                            value={stats.activeUsers}
                            icon={<IconUsers size={32} />}
                            color={theme.palette.info.main}
                            trend="up"
                            trendValue="+5%"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard
                            title="Taxa de Execução"
                            value={`${stats.executionRate}%`}
                            icon={<IconChartLine size={32} />}
                            color={theme.palette.warning.main}
                            trend="up"
                            trendValue="+3%"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard
                            title="Taxa de Sucesso"
                            value={`${stats.successRate}%`}
                            icon={<IconTrendingUp size={32} />}
                            color={theme.palette.success.main}
                            trend="stable"
                            trendValue="0%"
                        />
                    </Grid>
                </Grid>
                
                {/* Charts and Activity */}
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} md={8}>
                        <MainCard title="Visão Geral do Sistema" content={false}>
                            <Box sx={{ p: 3 }}>
                                <Alert severity="info" sx={{ mb: 3 }}>
                                    Gráficos de desempenho e analytics serão implementados com integração às APIs do Vercel e Z.ai
                                </Alert>
                                <Box 
                                    sx={{ 
                                        height: 300, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        backgroundColor: theme.palette.grey[50],
                                        borderRadius: 2,
                                        border: `2px dashed ${theme.palette.divider}`
                                    }}
                                >
                                    <Stack alignItems="center" spacing={2}>
                                        <IconChartLine size={48} color={theme.palette.text.secondary} />
                                        <Typography variant="h6" color="textSecondary">
                                            Gráficos de Analytics
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" align="center">
                                            Integração com APIs de estatísticas<br/>
                                            em desenvolvimento
                                        </Typography>
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
                                    <Button variant="outlined" size="small" fullWidth>
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