// frontend/src/components/reports/Chart.js
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Chart = ({
  type,
  data = [],
  title,
  height = 300,
  xKey,
  yKey,
  secondaryKey,
  dataKey, // Legacy prop support
}) => {
  // Handle legacy prop naming
  const xAxisKey = xKey || 'name';
  const yAxisKey = yKey || dataKey || 'value';

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={yAxisKey}
              stroke="#0088FE"
              strokeWidth={2}
              name={yAxisKey}
            />
            {secondaryKey && (
              <Line
                type="monotone"
                dataKey={secondaryKey}
                stroke="#00C49F"
                strokeWidth={2}
                name={secondaryKey}
              />
            )}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yAxisKey} fill="#0088FE" name={yAxisKey} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) =>
                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey={yAxisKey}
              nameKey={xAxisKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Unsupported chart type: {type}
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
