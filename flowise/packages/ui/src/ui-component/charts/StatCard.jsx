import React from 'react'
import PropTypes from 'prop-types'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    IconButton,
    Tooltip,
    useTheme
} from '@mui/material'
import {
    IconTrendingUp,
    IconTrendingDown,
    IconMinus,
    IconRefresh,
    IconInfoCircle
} from '@tabler/icons-react'
import { ResponsiveContainer, LineChart, Line } from 'recharts'

// Mini Sparkline Chart Component
const SparklineChart = ({ data, color, height = 40 }) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}

SparklineChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    color: PropTypes.string,
    height: PropTypes.number
}

// Main Stat Card Component
const StatCard = ({
    title,
    value,
    icon,
    color,
    trend,
    trendValue,
    trendColor,
    sparklineData,
    subtitle,
    action,
    loading = false,
    height = '100%',
    onClick
}) => {
    const theme = useTheme()

    const getTrendIcon = () => {
        if (trend === 'up') return <IconTrendingUp size={16} />
        if (trend === 'down') return <IconTrendingDown size={16} />
        return <IconMinus size={16} />
    }

    const getTrendColor = () => {
        if (trendColor) return trendColor
        if (trend === 'up') return theme.palette.success.main
        if (trend === 'down') return theme.palette.error.main
        return theme.palette.warning.main
    }

    const formatValue = (val) => {
        if (typeof val === 'number') {
            return val.toLocaleString('pt-BR')
        }
        return val
    }

    return (
        <Card
            sx={{
                height,
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                '&:hover': onClick ? {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8]
                } : {}
            }}
            onClick={onClick}
        >
            <CardContent sx={{ p: 3 }}>
                <Stack direction="column" justifyContent="space-between" height="100%">
                    {/* Header */}
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography
                                    variant="h4"
                                    color="textSecondary"
                                    gutterBottom
                                    sx={{ fontWeight: 500 }}
                                >
                                    {title}
                                </Typography>
                                {loading ? (
                                    <Box
                                        sx={{
                                            width: 60,
                                            height: 32,
                                            backgroundColor: theme.palette.grey[200],
                                            borderRadius: 1,
                                            animation: 'pulse 1.5s ease-in-out infinite'
                                        }}
                                    />
                                ) : (
                                    <Typography
                                        variant="h2"
                                        sx={{
                                            fontWeight: 700,
                                            color: color || theme.palette.primary.main,
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {formatValue(value)}
                                    </Typography>
                                )}
                                {subtitle && (
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        sx={{ mt: 0.5 }}
                                    >
                                        {subtitle}
                                    </Typography>
                                )}
                            </Box>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: (color || theme.palette.primary.main) + '15',
                                    color: color || theme.palette.primary.main,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {icon}
                            </Box>
                        </Stack>

                        {/* Trend Information */}
                        {trend && !loading && (
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
                                <Box sx={{ color: getTrendColor() }}>
                                    {getTrendIcon()}
                                </Box>
                                <Typography
                                    variant="body2"
                                    color={getTrendColor()}
                                    sx={{ fontWeight: 600 }}
                                >
                                    {trendValue}
                                </Typography>
                            </Stack>
                        )}
                    </Box>

                    {/* Sparkline Chart */}
                    {sparklineData && !loading && (
                        <Box sx={{ mt: 2 }}>
                            <SparklineChart
                                data={sparklineData}
                                color={color || theme.palette.primary.main}
                                height={40}
                            />
                        </Box>
                    )}

                    {/* Action Button */}
                    {action && (
                        <Box sx={{ mt: 2 }}>
                            <IconButton
                                size="small"
                                onClick={action.onClick}
                                sx={{
                                    backgroundColor: theme.palette.action.hover,
                                    '&:hover': {
                                        backgroundColor: theme.palette.action.selected
                                    }
                                }}
                            >
                                <action.icon size={16} />
                            </IconButton>
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    )
}

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.node.isRequired,
    color: PropTypes.string,
    trend: PropTypes.oneOf(['up', 'down', 'stable']),
    trendValue: PropTypes.string,
    trendColor: PropTypes.string,
    sparklineData: PropTypes.arrayOf(PropTypes.object),
    subtitle: PropTypes.string,
    action: PropTypes.shape({
        icon: PropTypes.node,
        onClick: PropTypes.func
    }),
    loading: PropTypes.bool,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onClick: PropTypes.func
}

// Enhanced Stat Card with more features
export const EnhancedStatCard = ({
    title,
    value,
    icon,
    color,
    trend,
    trendValue,
    change,
    changePeriod,
    sparklineData,
    formatType = 'number', // 'number', 'currency', 'percentage'
    tooltip,
    onRefresh,
    loading = false
}) => {
    const theme = useTheme()

    const formatValue = (val) => {
        if (loading) return '--'
        
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

    const cardContent = (
        <StatCard
            title={title}
            value={formatValue(value)}
            icon={icon}
            color={color}
            trend={trend}
            trendValue={trendValue}
            sparklineData={sparklineData}
            loading={loading}
            action={onRefresh ? {
                icon: IconRefresh,
                onClick: onRefresh
            } : undefined}
        />
    )

    if (tooltip) {
        return (
            <Tooltip title={tooltip} arrow>
                <Box>
                    {cardContent}
                </Box>
            </Tooltip>
        )
    }

    return cardContent
}

EnhancedStatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.node.isRequired,
    color: PropTypes.string,
    trend: PropTypes.oneOf(['up', 'down', 'stable']),
    trendValue: PropTypes.string,
    change: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    changePeriod: PropTypes.string,
    sparklineData: PropTypes.arrayOf(PropTypes.object),
    formatType: PropTypes.oneOf(['number', 'currency', 'percentage']),
    tooltip: PropTypes.string,
    onRefresh: PropTypes.func,
    loading: PropTypes.bool
}

export default StatCard