import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
    Grid,
    Box,
    Paper,
    Typography,
    IconButton,
    Button,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    Chip,
    useTheme
} from '@mui/material'
import {
    IconGridDots,
    IconPlus,
    IconSettings,
    IconX,
    IconDragDrop,
    IconRefresh,
    IconDownload
} from '@tabler/icons-react'

// Widget Types
const WIDGET_TYPES = {
    STAT_CARD: 'statCard',
    LINE_CHART: 'lineChart',
    BAR_CHART: 'barChart',
    PIE_CHART: 'PpieChart',
    AREA_CHART: 'areaChart',
    ACTIVITY_FEED: 'activityFeed'
}

// Default Widget Configurations
const DEFAULT_WIDGETS = [
    {
        id: 'totalChatflows',
        type: WIDGET_TYPES.STAT_CARD,
        title: 'Total Chatflows',
        size: { xs: 12, sm: 6, md: 4, lg: 3 },
        config: {
            icon: '🤖',
            color: 'primary',
            trend: 'up',
            trendValue: '+12%'
        }
    },
    {
        id: 'totalExecutions',
        type: WIDGET_TYPES.STAT_CARD,
        title: 'Execuções',
        size: { xs: 12, sm: 6, md: 4, lg: 3 },
        config: {
            icon: '📊',
            color: 'success',
            trend: 'up',
            trendValue: '+25%'
        }
    },
    {
        id: 'executionTrends',
        type: WIDGET_TYPES.LINE_CHART,
        title: 'Tendências de Execução',
        size: { xs: 12, md: 8 },
        config: {
            height: 300,
            lines: [
                { dataKey: 'executions', name: 'Execuções', color: '#8884d8' },
                { dataKey: 'users', name: 'Usuários', color: '#82ca9d' }
            ]
        }
    },
    {
        id: 'activityFeed',
        type: WIDGET_TYPES.ACTIVITY_FEED,
        title: 'Atividades Recentes',
        size: { xs: 12, md: 4 },
        config: {
            limit: 10
        }
    }
]

// Dashboard Grid Component
const DashboardGrid = ({
    widgets = DEFAULT_WIDGETS,
    data = {},
    onWidgetUpdate,
    onLayoutChange,
    editable = true,
    showControls = true
}) => {
    const theme = useTheme()
    const [dashboardWidgets, setDashboardWidgets] = useState(widgets)
    const [anchorEl, setAnchorEl] = useState(null)
    const [addWidgetDialog, setAddWidgetDialog] = useState(false)
    const [selectedWidgetType, setSelectedWidgetType] = useState('')

    const handleAddWidget = () => {
        setAnchorEl(null)
        setAddWidgetDialog(true)
    }

    const handleWidgetTypeSelect = (type) => {
        setSelectedWidgetType(type)
        setAddWidgetDialog(false)
        
        // Create new widget
        const newWidget = {
            id: `widget_${Date.now()}`,
            type,
            title: `Novo ${type}`,
            size: { xs: 12, md: 6 },
            config: getDefaultConfig(type)
        }
        
        const updatedWidgets = [...dashboardWidgets, newWidget]
        setDashboardWidgets(updatedWidgets)
        onLayoutChange?.(updatedWidgets)
    }

    const getDefaultConfig = (type) => {
        switch (type) {
            case WIDGET_TYPES.STAT_CARD:
                return {
                    icon: '📊',
                    color: 'primary',
                    trend: 'stable',
                    trendValue: '0%'
                }
            case WIDGET_TYPES.LINE_CHART:
                return {
                    height: 300,
                    lines: [
                        { dataKey: 'value', name: 'Valor', color: '#8884d8' }
                    ]
                }
            case WIDGET_TYPES.BAR_CHART:
                return {
                    height: 300,
                    bars: [
                        { dataKey: 'value', name: 'Valor', color: '#8884d8' }
                    ]
                }
            case WIDGET_TYPES.PIE_CHART:
                return {
                    height: 300,
                    dataKey: 'value',
                    nameKey: 'name'
                }
            case WIDGET_TYPES.AREA_CHART:
                return {
                    height: 300,
                    areas: [
                        { dataKey: 'value', name: 'Valor', color: '#8884d8' }
                    ]
                }
            case WIDGET_TYPES.ACTIVITY_FEED:
                return {
                    limit: 10
                }
            default:
                return {}
        }
    }

    const handleRemoveWidget = (widgetId) => {
        const updatedWidgets = dashboardWidgets.filter(w => w.id !== widgetId)
        setDashboardWidgets(updatedWidgets)
        onLayoutChange?.(updatedWidgets)
    }

    const handleWidgetResize = (widgetId, newSize) => {
        const updatedWidgets = dashboardWidgets.map(w => 
            w.id === widgetId ? { ...w, size: newSize } : w
        )
        setDashboardWidgets(updatedWidgets)
        onLayoutChange?.(updatedWidgets)
    }

    const renderWidget = (widget) => {
        const widgetData = data[widget.id] || {}
        
        switch (widget.type) {
            case WIDGET_TYPES.STAT_CARD:
                return (
                    <StatCardWidget
                        widget={widget}
                        data={widgetData}
                        onRemove={() => handleRemoveWidget(widget.id)}
                        editable={editable}
                    />
                )
            case WIDGET_TYPES.LINE_CHART:
                return (
                    <LineChartWidget
                        widget={widget}
                        data={widgetData}
                        onRemove={() => handleRemoveWidget(widget.id)}
                        editable={editable}
                    />
                )
            case WIDGET_TYPES.BAR_CHART:
                return (
                    <BarChartWidget
                        widget={widget}
                        data={widgetData}
                        onRemove={() => handleRemoveWidget(widget.id)}
                        editable={editable}
                    />
                )
            case WIDGET_TYPES.PIE_CHART:
                return (
                    <PieChartWidget
                        widget={widget}
                        data={widgetData}
                        onRemove={() => handleRemoveWidget(widget.id)}
                        editable={editable}
                    />
                )
            case WIDGET_TYPES.AREA_CHART:
                return (
                    <AreaChartWidget
                        widget={widget}
                        data={widgetData}
                        onRemove={() => handleRemoveWidget(widget.id)}
                        editable={editable}
                    />
                )
            case WIDGET_TYPES.ACTIVITY_FEED:
                return (
                    <ActivityFeedWidget
                        widget={widget}
                        data={widgetData}
                        onRemove={() => handleRemoveWidget(widget.id)}
                        editable={editable}
                    />
                )
            default:
                return null
        }
    }

    return (
        <Box>
            {/* Header Controls */}
            {showControls && editable && (
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Dashboard Personalizável
                    </Typography>
                    <Box>
                        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                            <IconPlus />
                        </IconButton>
                        <IconButton>
                            <IconRefresh />
                        </IconButton>
                        <IconButton>
                            <IconDownload />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                        >
                            <MenuItem onClick={() => handleWidgetTypeSelect(WIDGET_TYPES.STAT_CARD)}>
                                📊 Cartão de Estatísticas
                            </MenuItem>
                            <MenuItem onClick={() => handleWidgetTypeSelect(WIDGET_TYPES.LINE_CHART)}>
                                📈 Gráfico de Linhas
                            </MenuItem>
                            <MenuItem onClick={() => handleWidgetTypeSelect(WIDGET_TYPES.BAR_CHART)}>
                                📊 Gráfico de Barras
                            </MenuItem>
                            <MenuItem onClick={() => handleWidgetTypeSelect(WIDGET_TYPES.PIE_CHART)}>
                                🥧 Gráfico de Pizza
                            </MenuItem>
                            <MenuItem onClick={() => handleWidgetTypeSelect(WIDGET_TYPES.AREA_CHART)}>
                                📈 Gráfico de Área
                            </MenuItem>
                            <MenuItem onClick={() => handleWidgetTypeSelect(WIDGET_TYPES.ACTIVITY_FEED)}>
                                📋 Feed de Atividades
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>
            )}

            {/* Dashboard Grid */}
            <Grid container spacing={3}>
                {dashboardWidgets.map((widget) => (
                    <Grid item {...widget.size} key={widget.id}>
                        {renderWidget(widget)}
                    </Grid>
                ))}
            </Grid>

            {/* Add Widget Dialog */}
            <Dialog
                open={addWidgetDialog}
                onClose={() => setAddWidgetDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Adicionar Novo Widget</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Tipo de Widget</InputLabel>
                        <Select
                            value={selectedWidgetType}
                            label="Tipo de Widget"
                            onChange={(e) => setSelectedWidgetType(e.target.value)}
                        >
                            <MenuItem value={WIDGET_TYPES.STAT_CARD}>
                                📊 Cartão de Estatísticas
                            </MenuItem>
                            <MenuItem value={WIDGET_TYPES.LINE_CHART}>
                                📈 Gráfico de Linhas
                            </MenuItem>
                            <MenuItem value={WIDGET_TYPES.BAR_CHART}>
                                📊 Gráfico de Barras
                            </MenuItem>
                            <MenuItem value={WIDGET_TYPES.PIE_CHART}>
                                🥧 Gráfico de Pizza
                            </MenuItem>
                            <MenuItem value={WIDGET_TYPES.AREA_CHART}>
                                📈 Gráfico de Área
                            </MenuItem>
                            <MenuItem value={WIDGET_TYPES.ACTIVITY_FEED}>
                                📋 Feed de Atividades
                            </MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddWidgetDialog(false)}>Cancelar</Button>
                    <Button
                        onClick={() => handleWidgetTypeSelect(selectedWidgetType)}
                        variant="contained"
                        disabled={!selectedWidgetType}
                    >
                        Adicionar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

DashboardGrid.propTypes = {
    widgets: PropTypes.arrayOf(PropTypes.object),
    data: PropTypes.object,
    onWidgetUpdate: PropTypes.func,
    onLayoutChange: PropTypes.func,
    editable: PropTypes.bool,
    showControls: PropTypes.bool
}

// Placeholder Widget Components (to be implemented with actual chart components)
const StatCardWidget = ({ widget, data, onRemove, editable }) => {
    const theme = useTheme()
    
    return (
        <Paper sx={{ p: 3, position: 'relative' }}>
            {editable && (
                <IconButton
                    size="small"
                    onClick={onRemove}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                    <IconX size={16} />
                </IconButton>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" color="textSecondary">
                        {widget.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        {data.value || 0}
                    </Typography>
                </Box>
                <Box sx={{ fontSize: 32 }}>{widget.config.icon}</Box>
            </Box>
        </Paper>
    )
}

const LineChartWidget = ({ widget, data, onRemove, editable }) => (
    <Paper sx={{ p: 3, position: 'relative' }}>
        {editable && (
            <IconButton
                size="small"
                onClick={onRemove}
                sx={{ position: 'absolute', top: 8, right: 8 }}
            >
                <IconX size={16} />
            </IconButton>
        )}
        <Typography variant="h6" gutterBottom>
            {widget.title}
        </Typography>
        <Box sx={{ height: widget.config.height || 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="textSecondary">Gráfico de Linhas</Typography>
        </Box>
    </Paper>
)

const BarChartWidget = ({ widget, data, onRemove, editable }) => (
    <Paper sx={{ p: 3, position: 'relative' }}>
        {editable && (
            <IconButton
                size="small"
                onClick={onRemove}
                sx={{ position: 'absolute', top: 8, right: 8 }}
            >
                <IconX size={16} />
            </IconButton>
        )}
        <Typography variant="h6" gutterBottom>
            {widget.title}
        </Typography>
        <Box sx={{ height: widget.config.height || 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="textSecondary">Gráfico de Barras</Typography>
        </Box>
    </Paper>
)

const PieChartWidget = ({ widget, data, onRemove, editable }) => (
    <Paper sx={{ p: 3, position: 'relative' }}>
        {editable && (
            <IconButton
                size="small"
                onClick={onRemove}
                sx={{ position: 'absolute', top: 8, right: 8 }}
            >
                <IconX size={16} />
            </IconButton>
        )}
        <Typography variant="h6" gutterBottom>
            {widget.title}
        </Typography>
        <Box sx={{ height: widget.config.height || 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="textSecondary">Gráfico de Pizza</Typography>
        </Box>
    </Paper>
)

const AreaChartWidget = ({ widget, data, onRemove, editable }) => (
    <Paper sx={{ p: 3, position: 'relative' }}>
        {editable && (
            <IconButton
                size="small"
                onClick={onRemove}
                sx={{ position: 'absolute', top: 8, right: 8 }}
            >
                <IconX size={16} />
            </IconButton>
        )}
        <Typography variant="h6" gutterBottom>
            {widget.title}
        </Typography>
        <Box sx={{ height: widget.config.height || 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="textSecondary">Gráfico de Área</Typography>
        </Box>
    </Paper>
)

const ActivityFeedWidget = ({ widget, data, onRemove, editable }) => (
    <Paper sx={{ p: 3, position: 'relative' }}>
        {editable && (
            <IconButton
                size="small"
                onClick={onRemove}
                sx={{ position: 'absolute', top: 8, right: 8 }}
            >
                <IconX size={16} />
            </IconButton>
        )}
        <Typography variant="h6" gutterBottom>
            {widget.title}
        </Typography>
        <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {data.activities?.slice(0, widget.config.limit || 10).map((activity, index) => (
                <Box key={index} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                    <Typography variant="body2">{activity.description}</Typography>
                    <Typography variant="caption" color="textSecondary">
                        {activity.timestamp}
                    </Typography>
                </Box>
            )) || (
                <Typography color="textSecondary" align="center">
                    Nenhuma atividade recente
                </Typography>
            )}
        </Box>
    </Paper>
)

StatCardWidget.propTypes = BarChartWidget.propTypes = PieChartWidget.propTypes = 
AreaChartWidget.propTypes = ActivityFeedWidget.propTypes = {
    widget: PropTypes.object.isRequired,
    data: PropTypes.object,
    onRemove: PropTypes.func,
    editable: PropTypes.bool
}

export default DashboardGrid
export { WIDGET_TYPES, DEFAULT_WIDGETS }