'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

export default function AgentCharts({ transactions }: { transactions: any[] }) {
  // Aggregate spending by date
  const spendingByDate = transactions.reduce((acc: any, tx: any) => {
    const date = new Date(tx.createdAt).toLocaleDateString()
    if (!acc[date]) acc[date] = { date, amount: 0, risk: 0, count: 0 }
    acc[date].amount += tx.amount
    acc[date].risk += tx.riskScore
    acc[date].count += 1
    return acc
  }, {})

  const trendData = Object.values(spendingByDate).map((d: any) => ({
    ...d,
    avgRisk: Math.round(d.risk / d.count)
  })).reverse() // Older to newer assuming descending input

  // Aggregate spending by provider
  const providerData = transactions.reduce((acc: any, tx: any) => {
    const provider = tx.provider.name
    if (!acc[provider]) acc[provider] = { name: provider, spent: 0, blocks: 0 }
    if (tx.status === 'COMPLETED') acc[provider].spent += tx.amount
    if (tx.status === 'BLOCKED') acc[provider].blocks += 1
    return acc
  }, {})

  const barData = Object.values(providerData)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Spending Trend</CardTitle>
          <CardDescription>Daily transaction volume (₹)</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Top Providers</CardTitle>
          <CardDescription>Total spent per provider</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              />
              <Bar dataKey="spent" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
