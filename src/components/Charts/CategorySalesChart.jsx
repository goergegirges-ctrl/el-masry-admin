import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useChartColors } from '../../hooks/useChartColors';

const SLICE_COLORS = ['#00B4D8', '#2E86AB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#F43F5E'];

const CategorySalesChart = ({ data }) => {
    const chartColors = useChartColors();

    return (
        <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: chartColors.surface,
                            border: `1px solid ${chartColors.border}`,
                            borderRadius: 8,
                            fontSize: 12,
                            color: chartColors.text,
                        }}
                        formatter={(value) => [`${value.toLocaleString()} EGP`, 'Revenue']}
                    />
                    <Legend
                        formatter={(value) => (
                            <span style={{ color: chartColors.textLight, fontSize: 11 }}>{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CategorySalesChart;
