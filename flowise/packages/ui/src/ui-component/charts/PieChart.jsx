import React from 'react'
import PropTypes from 'prop-types'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, formatValue }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
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
                    {data.name}
                </p>
                <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                    {`Valor: ${formatValue ? formatValue(data.value) : data.value}`}
                </p>
                <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                    {`Porcentagem: ${data.percentage}%`}
                </p>
            </div>
        )
    }
    return null
}

CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    formatValue: PropTypes.func
}

// Custom Legend Component
const CustomLegend = ({ payload }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '16px',
                marginTop: '16px',
                fontSize: '12px'
            }}
        >
            {payload.map((entry, index) => (
                <div
                    key={index}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <div
                        style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: entry.color,
                            borderRadius: '2px'
                        }}
                    />
                    <span style={{ color: '#666' }}>
                        {entry.value} ({entry.payload.percentage}%)
                    </span>
                </div>
            ))}
        </div>
    )
}

CustomLegend.propTypes = {
    payload: PropTypes.array
}

// Main Pie Chart Component
const CustomPieChart = ({
    data,
    dataKey = 'value',
    nameKey = 'name',
    height = 300,
    width = '100%',
    innerRadius = 0,
    outerRadius = 80,
    paddingAngle = 0,
    showTooltip = true,
    showLegend = true,
    formatValue,
    colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#ff6b6b', '#4ecdc4', '#45b7d1'],
    startAngle = 90,
    endAngle = -270
}) => {
    // Calculate percentages
    const total = data.reduce((sum, item) => sum + (item[dataKey] || 0), 0)
    const dataWithPercentage = data.map(item => ({
        ...item,
        percentage: total > 0 ? Math.round((item[dataKey] / total) * 100) : 0
    }))

    return (
        <div style={{ width, height }}>
            <ResponsiveContainer width="100%" height={height - (showLegend ? 40 : 0)}>
                <PieChart>
                    <Pie
                        data={dataWithPercentage}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={paddingAngle}
                        dataKey={dataKey}
                        nameKey={nameKey}
                        startAngle={startAngle}
                        endAngle={endAngle}
                    >
                        {dataWithPercentage.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color || colors[index % colors.length]}
                                stroke="#fff"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
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
                </PieChart>
            </ResponsiveContainer>
            {showLegend && <CustomLegend payload={dataWithPercentage.map((item, index) => ({
                value: item[nameKey],
                color: item.color || colors[index % colors.length],
                payload: item
            }))} />}
        </div>
    )
}

CustomPieChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    dataKey: PropTypes.string,
    nameKey: PropTypes.string,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    innerRadius: PropTypes.number,
    outerRadius: PropTypes.number,
    paddingAngle: PropTypes.number,
    showTooltip: PropTypes.bool,
    showLegend: PropTypes.bool,
    formatValue: PropTypes.func,
    colors: PropTypes.arrayOf(PropTypes.string),
    startAngle: PropTypes.number,
    endAngle: PropTypes.number
}

export default CustomPieChart