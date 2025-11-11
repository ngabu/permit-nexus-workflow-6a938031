import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts"

const revenueData = [
  { month: "Jan", revenue: 45000, growth: 12 },
  { month: "Feb", revenue: 52000, growth: 15 },
  { month: "Mar", revenue: 48000, growth: -8 },
  { month: "Apr", revenue: 61000, growth: 27 },
  { month: "May", revenue: 55000, growth: -10 },
  { month: "Jun", revenue: 67000, growth: 22 },
]

const permitsData = [
  { type: "Environmental", count: 156, value: 45 },
  { type: "Construction", count: 89, value: 25 },
  { type: "Mining", count: 67, value: 20 },
  { type: "Industrial", count: 34, value: 10 },
]

const COLORS = ['hsl(156 72% 24%)', 'hsl(156 65% 35%)', 'hsl(180 65% 75%)', 'hsl(142 70% 45%)']

export function RevenueChart() {
  return (
    <Card className="col-span-2 bg-card/50 backdrop-blur-sm border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Monthly Revenue Trend
          <span className="text-sm font-normal text-muted-foreground">Last 6 months</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-card)'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function PermitsChart() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/60">
      <CardHeader>
        <CardTitle>Permit Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={permitsData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ type, value }) => `${type} ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {permitsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-card)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function TeamPerformanceChart() {
  const teamData = [
    { name: "Environmental", completed: 145, pending: 23, efficiency: 86 },
    { name: "Legal", completed: 89, pending: 12, efficiency: 88 },
    { name: "Engineering", completed: 156, pending: 34, efficiency: 82 },
    { name: "Compliance", completed: 98, pending: 18, efficiency: 84 },
  ]

  return (
    <Card className="col-span-2 bg-card/50 backdrop-blur-sm border-border/60">
      <CardHeader>
        <CardTitle>Team Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={teamData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-card)'
              }}
            />
            <Bar 
              dataKey="completed" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              name="Completed"
            />
            <Bar 
              dataKey="pending" 
              fill="hsl(var(--accent))" 
              radius={[4, 4, 0, 0]}
              name="Pending"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}