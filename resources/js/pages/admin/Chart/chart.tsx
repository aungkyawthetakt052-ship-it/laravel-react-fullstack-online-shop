import React from 'react';
import { Head } from '@inertiajs/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

interface MonthlySale {
  name: string;
  total: number;
}

interface OrderStatusItem {
  name: string;
  value: number;
}

interface ChartProps {
  monthlySales: MonthlySale[];
  orderStatus: OrderStatusItem[];
}

export default function Chart({ monthlySales, orderStatus }: ChartProps) {
  return (
    <div className="p-6 dark:text-white">
      <Head title="Charts" />

      <h1 className="text-2xl font-bold mb-6">Dashboard Charts</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
          <h2 className="font-semibold mb-4 dark:text-white">
            Monthly Sales (Line)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={2}
                name="Total Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
          <h2 className="font-semibold mb-4 dark:text-white">
            Monthly Sales (Bar)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#22c55e" name="Total Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 lg:col-span-2">
          <h2 className="font-semibold mb-4 dark:text-white">
            Order Status (Pie)
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={orderStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, percent }) =>
                  `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
              >
                {orderStatus.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}