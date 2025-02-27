import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import type { ArtilleryReport } from '@/types/artillery';

// Color palette matching Artillery Cloud
const COLORS = {
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  border: '#333333',
  gridLine: 'rgba(255, 255, 255, 0.1)',
  chart: {
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    purple: '#8b5cf6',
    area: 'rgba(59, 130, 246, 0.1)'
  }
};

// Pie chart colors
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

interface ReportViewerProps {
  report: ArtilleryReport;
  onReset: () => void;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

export default function ReportViewer({ report, onReset }: ReportViewerProps) {
  // Calculate test duration
  const testDuration = (report.aggregate.lastMetricAt - report.aggregate.firstMetricAt) / (1000 * 60);

  const responseTimeData = report.intermediate.map((result) => {
    const responseTime = result.summaries?.['http.response_time'];
    return {
      timestamp: new Date(parseInt(result.period)).toLocaleTimeString(),
      min: (responseTime?.min || 0) / 1000,
      mean: (responseTime?.mean || 0) / 1000,
      max: (responseTime?.max || 0) / 1000,
      p95: (responseTime?.p95 || 0) / 1000,
      p99: (responseTime?.p99 || 0) / 1000,
    };
  }).filter(data => data.max > 0);

  const requestsData = report.intermediate.map((result) => {
    return {
      timestamp: new Date(parseInt(result.period)).toLocaleTimeString(),
      requests: result.counters?.['http.requests'] || 0,
      responses: result.counters?.['http.responses'] || 0,
      success: result.counters?.['http.codes.200'] || 0,
      skipped: result.counters?.['vusers.skipped'] || 0,
      vusers: result.counters?.['vusers.created'] || 0,
    };
  });

  // Get all unique virtual user scenarios
  const virtualUserScenarios = Object.keys(report.aggregate.counters)
    .filter(key => key.startsWith('vusers.created_by_name.'))
    .map(key => ({
      name: key.replace('vusers.created_by_name.', ''),
      count: report.aggregate.counters[key]
    }));

  // Format for the tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#242424] border border-[#333333] rounded-lg p-3 shadow-lg">
          <p className="text-sm text-white mb-2">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}s
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">Load Test Results</h2>
          <p className="text-sm text-gray-400">Duration: {testDuration.toFixed(1)}min</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-[#333333] rounded-lg transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Upload Another Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <h3 className="text-lg font-medium mb-4 text-white">Load Summary</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="metric-label">Total Requests</dt>
              <dd className="metric-value">{report.aggregate.counters['http.requests'] || 0}</dd>
            </div>
            <div>
              <dt className="metric-label">Success Rate</dt>
              <dd className="metric-value text-green-500">
                {((report.aggregate.counters['http.codes.200'] || 0) / 
                  (report.aggregate.counters['http.requests'] || 1) * 100).toFixed(1)}%
              </dd>
            </div>
            <div>
              <dt className="metric-label">Virtual Users</dt>
              <dd className="metric-value">{report.aggregate.counters['vusers.created'] || 0}</dd>
            </div>
            <div>
              <dt className="metric-label">Avg Response</dt>
              <dd className="metric-value">
                {(report.aggregate.summaries['http.response_time']?.mean / 1000 || 0).toFixed(2)}s
              </dd>
            </div>
          </dl>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-medium mb-4 text-white">Scenarios</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={virtualUserScenarios}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {virtualUserScenarios.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-medium mb-4 text-white">HTTP Performance</h3>
          <div className="space-y-2">
            {['min', 'mean', 'p95', 'p99', 'max'].map((metric) => (
              <div key={metric} className="flex items-center">
                <div className="w-20 text-sm text-gray-400">{metric}</div>
                <div className="flex-1 h-8 bg-[#1a1a1a] rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${(report.aggregate.summaries['http.response_time']?.[metric as keyof typeof report.aggregate.summaries['http.response_time']] || 0) / 
                        (report.aggregate.summaries['http.response_time']?.max || 1) * 100}%`
                    }}
                  />
                </div>
                <div className="w-24 text-right text-sm text-white">
                  {(report.aggregate.summaries['http.response_time']?.[metric as keyof typeof report.aggregate.summaries['http.response_time']] / 1000 || 0).toFixed(2)}s
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 md:col-span-3">
          <h3 className="text-lg font-medium mb-4 text-white">Request Rate & Virtual Users</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={requestsData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.chart.blue} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={COLORS.chart.blue} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} />
                <XAxis dataKey="timestamp" stroke={COLORS.textSecondary} />
                <YAxis stroke={COLORS.textSecondary} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="requests" 
                  stroke={COLORS.chart.blue} 
                  fill="url(#colorRequests)" 
                  name="Requests"
                />
                <Line 
                  type="monotone" 
                  dataKey="vusers" 
                  stroke={COLORS.chart.purple} 
                  name="Virtual Users" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 md:col-span-3">
          <h3 className="text-lg font-medium mb-4 text-white">Response Time Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} />
                <XAxis dataKey="timestamp" stroke={COLORS.textSecondary} />
                <YAxis stroke={COLORS.textSecondary} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="mean" stroke={COLORS.chart.blue} name="Mean" strokeWidth={2} />
                <Line type="monotone" dataKey="p95" stroke={COLORS.chart.green} name="p95" strokeWidth={2} />
                <Line type="monotone" dataKey="p99" stroke={COLORS.chart.yellow} name="p99" strokeWidth={2} />
                <Line type="monotone" dataKey="max" stroke={COLORS.chart.red} name="Max" strokeWidth={2} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 