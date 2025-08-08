import React from 'react'
import PropTypes from 'prop-types'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, formatValue }) => {
    if (active && payload && payload.length) {
        return (
            <div
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    fontSize: '14px'
                }}
            >
                <p style={{ margin: 0, fontWeight: 600, color: '#333' }}>
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <p
                        key={index}
                        style={{
                            margin: '4px 0 0 0',
                            color: entry.color,
                            fontWeight: 500
                        }}
                    >
                        {`${entry.name}: ${formatValue ? formatValue(entry.value) : entry.value}`}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.string,
    formatValue: PropTypes.func
}

// Main Area Chart Component
const CustomAreaChart = ({
    data,
    areas,
    xAxisDataKey = 'date',
    height = 300,
    width = '100%',
    margin = { top: 5, right: 30, left: 20, bottom: 5 },
    showGrid = true,
    showLegend = true,
    showTooltip = true,
    formatValue,
    colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'],
    strokeWidth = 2,
    opacity = 0.6,
    stacked = false
}) => {
    return (
        <ResponsiveContainer width={width} height={height}>
            <AreaChart
                data={data}
                margin={margin}
            >
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
                <XAxis
                    dataKey={xAxisDataKey}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                />
                {showTooltip && (
                    <Tooltip
                        content={<CustomTooltip formatValue={formatValue} />}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                    />
                )}
                {showLegend && (
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        iconSize={10}
                    />
                )}
                {areas.map((area, index) => (
                    <Area
                        key={area.dataKey}
                        type="monotone"
                        dataKey={area.dataKey}
                        stackId={stacked ? "1" : undefined}
                        stroke={area.strokeColor || area.color || colors[index % colors.length]}
                        fill={area.color || colors[index % colors.length]}
                        fillOpacity={area.opacity || opacity}
                        strokeWidth={area.strokeWidth || strokeWidth}
                        name={area.name}
                        unit={area.unit}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    )
}

CustomAreaChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    areas: PropTypes.arrayOf(
        PropTypes.shape({
            dataKey: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            color: PropTypes.string,
            strokeColor: PropTypes.string,
            strokeWidth: PropTypes.number,
            opacity: PropTypes.number,
            unit: PropTypes.string
        })
    ).isRequired,
    xAxisDataKey: PropTypes.string,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    margin: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        left: PropTypes.number,
        bottom: PropTypes.number
    }),
    showGrid: PropTypes.bool,
    showLegend: PropTypes.bool,
    showTooltip: PropTypes.bool,
    formatValue: PropTypes.func,
    colors: PropTypes.arrayOf(PropTypes.string),
    strokeWidth: PropTypes.number,
    opacity: PropTypes.number,
    stacked: PropTypes.bool
}

export default CustomAreaChart