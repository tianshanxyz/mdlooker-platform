'use client';

import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// 注册 ChartJS 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface CountrySummary {
  name: string;
  name_zh: string;
  count: number;
  flag: string;
}

interface CountrySummaryChartProps {
  data: {
    countries: CountrySummary[];
    total: number;
  };
  isZh: boolean;
}

export function CountrySummaryChart({ data, isZh }: CountrySummaryChartProps) {
  const chartData = {
    labels: data.countries.map(c => isZh ? `${c.flag} ${c.name_zh}` : `${c.flag} ${c.name}`),
    datasets: [
      {
        label: isZh ? '注册数量' : 'Registrations',
        data: data.countries.map(c => c.count),
        backgroundColor: [
          'rgba(51, 153, 153, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(139, 92, 246, 0.7)',
        ],
        borderColor: [
          'rgb(51, 153, 153)',
          'rgb(59, 130, 246)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: isZh ? '各国注册数量对比' : 'Registrations by Country',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: isZh ? '注册数量' : 'Number of Registrations',
        },
      },
    },
  };

  return (
    <div className="w-full h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}

interface MonthlyTrend {
  month: string;
  nmpa: number;
  fda: number;
  eudamed: number;
  total: number;
}

interface MonthlyTrendChartProps {
  data: {
    trend: MonthlyTrend[];
  };
  isZh: boolean;
}

export function MonthlyTrendChart({ data, isZh }: MonthlyTrendChartProps) {
  const chartData = {
    labels: data.trend.map(t => t.month),
    datasets: [
      {
        label: 'NMPA (中国)',
        data: data.trend.map(t => t.nmpa),
        borderColor: 'rgb(51, 153, 153)',
        backgroundColor: 'rgba(51, 153, 153, 0.1)',
        tension: 0.3,
      },
      {
        label: 'FDA (美国)',
        data: data.trend.map(t => t.fda),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
      },
      {
        label: 'EUDAMED (欧盟)',
        data: data.trend.map(t => t.eudamed),
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: isZh ? '月度注册趋势' : 'Monthly Registration Trend',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: isZh ? '注册数量' : 'Number of Registrations',
        },
      },
      x: {
        title: {
          display: true,
          text: isZh ? '月份' : 'Month',
        },
      },
    },
  };

  return (
    <div className="w-full h-80">
      <Line data={chartData} options={options} />
    </div>
  );
}
