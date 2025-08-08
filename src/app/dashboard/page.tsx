'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart } from '@/components/charts/LineChart'
import { BarChart } from '@/components/charts/BarChart'
import { PieChart } from '@/components/charts/PieChart'
import { AreaChart } from '@/components/charts/AreaChart'
import { StatCard } from '@/components/charts/StatCard'
import { Users, FolderOpen, Zap, Activity, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  name?: string
  avatar?: string
}

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalProjects: number
  activeProjects: number
  totalFlows: number
  activeFlows: number
  systemUptime: string
  lastUpdated: string
}

interface DashboardAnalytics {
  userGrowth: {
    daily: number[]
    weekly: number[]
    monthly: number[]
  }
  projectStats: {
    byStatus: Record<string, number>
    byCategory: Record<string, number>
  }
  flowPerformance: {
    averageExecutionTime: number
    successRate: number
    totalExecutions: number
    errorRate: number
  }
  systemMetrics: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    networkLatency: number
  }
}

interface DashboardTrends {
  userEngagement: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      color: string
    }>
  }
  projectGrowth: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      color: string
    }>
  }
  flowUsage: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      color: string
    }>
  }
  performanceMetrics: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      color: string
    }>
  }
}

interface DashboardComparison {
  periodComparison: {
    currentPeriod: Record<string, number>
    previousPeriod: Record<string, number>
    changes: Record<string, number>
  }
  categoryComparison: Record<string, any>
  performanceComparison: Record<string, any>
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [trends, setTrends] = useState<DashboardTrends | null>(null)
  const [comparison, setComparison] = useState<DashboardComparison | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  const { user: authUser, loading: authLoading, isConfigured, signOut } = useAuth()

  useEffect(() => {
    if (!authLoading && authUser) {
      setUser({
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
        avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture
      })
      setLoading(false)
    } else if (!authLoading && !authUser) {
      setLoading(false)
    }
  }, [authUser, authLoading])

  useEffect(() => {
    if (authUser && isConfigured) {
      fetchDashboardData()
    }
  }, [authUser, isConfigured])

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true)
      
      const [statsRes, analyticsRes, trendsRes, comparisonRes] = await Promise.all([
        fetch('/api/v1/dashboard/stats'),
        fetch('/api/v1/dashboard/analytics'),
        fetch('/api/v1/dashboard/trends'),
        fetch('/api/v1/dashboard/comparison')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData.data)
      }

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json()
        setTrends(trendsData.data)
      }

      if (comparisonRes.ok) {
        const comparisonData = await comparisonRes.json()
        setComparison(comparisonData.data)
      }
    } catch (err) {
      setError('Failed to fetch dashboard data')
    } finally {
      setDataLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (err) {
      setError('Failed to logout')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertDescription>
              Supabase não está configurado. Por favor, configure as variáveis de ambiente.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => window.location.href = '/login'}>
              Ir para Configuração
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
          <Button
            onClick={() => window.location.href = '/login'}
            className="mt-4"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    )
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Flowise UrbanDev</h1>
              <p className="text-sm text-gray-600">Dashboard Analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user?.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name || user.email}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Usuários"
                value={stats.totalUsers}
                description="Usuários registrados no sistema"
                trend={comparison?.periodComparison.changes.users ? {
                  value: comparison.periodComparison.changes.users,
                  isPositive: comparison.periodComparison.changes.users > 0
                } : undefined}
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Projetos Ativos"
                value={stats.activeProjects}
                description="Projetos em andamento"
                trend={comparison?.periodComparison.changes.projects ? {
                  value: comparison.periodComparison.changes.projects,
                  isPositive: comparison.periodComparison.changes.projects > 0
                } : undefined}
                icon={<FolderOpen className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Flows Ativos"
                value={stats.activeFlows}
                description="Flows em execução"
                trend={comparison?.periodComparison.changes.flows ? {
                  value: comparison.periodComparison.changes.flows,
                  isPositive: comparison.periodComparison.changes.flows > 0
                } : undefined}
                icon={<Zap className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Uptime do Sistema"
                value={stats.systemUptime}
                description="Disponibilidade do sistema"
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
          )}

          {/* Charts Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="analytics">Análises</TabsTrigger>
              <TabsTrigger value="trends">Tendências</TabsTrigger>
              <TabsTrigger value="comparison">Comparação</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Engagement Chart */}
                {trends && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Engajamento de Usuários</CardTitle>
                      <CardDescription>Atividade de usuários ao longo do tempo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LineChart
                        data={trends.userEngagement.labels.map((label, index) => ({
                          label,
                          ...trends.userEngagement.datasets.reduce((acc, dataset) => {
                            acc[dataset.label] = dataset.data[index]
                            return acc
                          }, {} as any)
                        }))}
                        xAxisKey="label"
                        lines={trends.userEngagement.datasets.map(dataset => ({
                          dataKey: dataset.label,
                          stroke: dataset.color,
                          name: dataset.label
                        }))}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Project Status Chart */}
                {analytics && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Status dos Projetos</CardTitle>
                      <CardDescription>Distribuição de projetos por status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PieChart
                        data={Object.entries(analytics.projectStats.byStatus).map(([name, value]) => ({
                          name,
                          value,
                          color: name === 'active' ? '#10b981' : 
                                 name === 'completed' ? '#3b82f6' :
                                 name === 'paused' ? '#f59e0b' : '#ef4444'
                        }))}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Flow Usage Chart */}
              {trends && (
                <Card>
                  <CardHeader>
                    <CardTitle>Uso de Flows</CardTitle>
                    <CardDescription>Execuções de flows por dia da semana</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={trends.flowUsage.labels.map((label, index) => ({
                        label,
                        ...trends.flowUsage.datasets.reduce((acc, dataset) => {
                          acc[dataset.label] = dataset.data[index]
                          return acc
                        }, {} as any)
                      }))}
                      xAxisKey="label"
                      bars={trends.flowUsage.datasets.map(dataset => ({
                        dataKey: dataset.label,
                        fill: dataset.color,
                        name: dataset.label
                      }))}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Metrics */}
                {analytics && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Métricas do Sistema</CardTitle>
                      <CardDescription>Uso de recursos do sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>CPU Usage</span>
                            <span>{analytics.systemMetrics.cpuUsage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${analytics.systemMetrics.cpuUsage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Memory Usage</span>
                            <span>{analytics.systemMetrics.memoryUsage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${analytics.systemMetrics.memoryUsage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Disk Usage</span>
                            <span>{analytics.systemMetrics.diskUsage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-600 h-2 rounded-full" 
                              style={{ width: `${analytics.systemMetrics.diskUsage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Flow Performance */}
                {analytics && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance de Flows</CardTitle>
                      <CardDescription>Estatísticas de execução de flows</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {analytics.flowPerformance.averageExecutionTime}s
                          </div>
                          <div className="text-sm text-gray-600">Tempo Médio</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {analytics.flowPerformance.successRate}%
                          </div>
                          <div className="text-sm text-gray-600">Taxa de Sucesso</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {analytics.flowPerformance.totalExecutions.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Total Execuções</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {analytics.flowPerformance.errorRate}%
                          </div>
                          <div className="text-sm text-gray-600">Taxa de Erro</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Project Categories */}
              {analytics && (
                <Card>
                  <CardHeader>
                    <CardTitle>Projetos por Categoria</CardTitle>
                    <CardDescription>Distribuição de projetos por tipo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={Object.entries(analytics.projectStats.byCategory).map(([name, value]) => ({
                        name,
                        value
                      }))}
                      xAxisKey="name"
                      bars={[{
                        dataKey: "value",
                        fill: "#3b82f6",
                        name: "Projetos"
                      }]}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Growth */}
                {trends && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Crescimento de Projetos</CardTitle>
                      <CardDescription>Projetos criados vs concluídos por trimestre</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AreaChart
                        data={trends.projectGrowth.labels.map((label, index) => ({
                          label,
                          ...trends.projectGrowth.datasets.reduce((acc, dataset) => {
                            acc[dataset.label] = dataset.data[index]
                            return acc
                          }, {} as any)
                        }))}
                        xAxisKey="label"
                        areas={trends.projectGrowth.datasets.map(dataset => ({
                          dataKey: dataset.label,
                          fill: dataset.color,
                          stroke: dataset.color,
                          name: dataset.label
                        }))}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Performance Metrics */}
                {trends && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Métricas de Performance</CardTitle>
                      <CardDescription>Tempo de resposta e taxa de sucesso</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LineChart
                        data={trends.performanceMetrics.labels.map((label, index) => ({
                          label,
                          ...trends.performanceMetrics.datasets.reduce((acc, dataset) => {
                            acc[dataset.label] = dataset.data[index]
                            return acc
                          }, {} as any)
                        }))}
                        xAxisKey="label"
                        lines={trends.performanceMetrics.datasets.map(dataset => ({
                          dataKey: dataset.label,
                          stroke: dataset.color,
                          name: dataset.label
                        }))}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              {comparison && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Comparação de Períodos</CardTitle>
                      <CardDescription>Período atual vs período anterior</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(comparison.periodComparison.currentPeriod).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{value}</span>
                              <span className="text-sm text-gray-500">vs {comparison.periodComparison.previousPeriod[key]}</span>
                              <span className={`text-sm ${comparison.periodComparison.changes[key] > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {comparison.periodComparison.changes[key] > 0 ? '+' : ''}{comparison.periodComparison.changes[key]}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Comparação de Performance</CardTitle>
                      <CardDescription>Melhorias de performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(comparison.performanceComparison).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{value.current}</span>
                              <span className="text-sm text-gray-500">vs {value.previous}</span>
                              <span className={`text-sm ${value.improvement ? 'text-green-600' : 'text-red-600'}`}>
                                {value.change > 0 ? '+' : ''}{value.change}%
                              </span>
                              {value.improvement && <CheckCircle className="h-4 w-4 text-green-600" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}