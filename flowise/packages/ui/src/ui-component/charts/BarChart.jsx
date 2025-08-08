import React from 'react'
import PropTypes from 'prop-types'
import {
    BarChart,
    Bar,
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

// Main Bar Chart Component
const CustomBarChart = ({
    data,
    bars,
    xAxisDataKey = 'name',
    height = 300,
    width = '100%',
    margin = { top: 5, right: 30, left: 20, bottom: 5 },
    showGrid = true,
    showLegend = true,
    showTooltip = true,
    formatValue,
    colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'],
    barSize = 30,
    layout = 'vertical' // 'vertical' or 'horizontal'
}) => {
    return (
        <ResponsiveContainer width={width} height={height}>
            <BarChart
                data={data}
                margin={margin}
                layout={layout}
            >
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
                {layout === 'vertical' ? (
                    <>
                        <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} />
                        <YAxis
                            dataKey={xAxisDataKey}
                            type="category"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            width={80}
                        />
                    </>
                ) : (
                    <>
                        <XAxis
                            dataKey={xAxisDataKey}
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                        />
                        <YAxis type="number" tick={{ fontSize: 12 }} tickLine={false} />
                    </>
                )}
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
                        iconType="square"
                        iconSize={12}
                    />
                )}
                {bars.map((bar, index) => (
                    <Bar
                        key={bar.dataKey}
                        dataKey={bar.dataKey}
                        fill={bar.color || colors[index % colors.length]}
                        name={bar.name}
                        radius={bar.radius || [4, 4, 0, 0]}
                        maxBarSize={bar.maxBarSize || barSize}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    )
}

CustomBarChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    bars: PropTypes.arrayOf(
        PropTypes.shape({
            dataKey: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            color: PropTypes.string,
            radius: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
            maxBarSize: PropTypes.number
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
    barSize: PropTypes.number,
    layout: PropTypes.oneOf(['vertical', 'horizontal'])
}

export default CustomBarChart