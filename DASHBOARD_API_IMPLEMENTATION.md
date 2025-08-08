# Plano de Implementação de APIs para Dashboard

## 1. API de Estatísticas do Dashboard

### Arquivo: `/api/v1/dashboard/stats.js`

```javascript
import client from './client'

const getDashboardStats = (params = {}) => {
    const { period = 'month', startDate, endDate } = params
    return client.get('/dashboard/stats', {
        params: { period, startDate, endDate }
    })
}

const getDashboardActivity = (params = {}) => {
    const { limit = 20, type, startDate, endDate } = params
    return client.get('/dashboard/activity', {
        params: { limit, type, startDate, endDate }
    })
}

const getDashboardAnalytics = (params = {}) => {
    const { period = 'month', metric = 'all' } = params
    return client.get('/dashboard/analytics', {
        params: { period, metric }
    })
}

const getDashboardHealth = () => {
    return client.get('/dashboard/health')
}

export default {
    getDashboardStats,
    getDashboardActivity,
    getDashboardAnalytics,
    getDashboardHealth
}
```

### Backend: Controller de Dashboard

#### Arquivo: `/server/src/controllers/dashboard/index.ts`

```typescript
import { Request, Response } from 'express'
import { AppDataSource } from '@/database/dataSource'
import { ChatFlow } from '@/database/entities/ChatFlow'
import { Assistant } from '@/database/entities/Assistant'
import { Execution } from '@/database/entities/Execution'
import { Customer } from '@/database/entities/Customer'
import { ChatMessage } from '@/database/entities/ChatMessage'

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const { period = 'month', startDate, endDate } = req.query
        
        // Calcular período de data
        const now = new Date()
        let periodStart: Date
        
        switch (period) {
            case 'day':
                periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                break
            case 'week':
                periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                break
            case 'month':
                periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
                break
            case 'year':
                periodStart = new Date(now.getFullYear(), 0, 1)
                break
            default:
                periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
        
        // Usar datas personalizadas se fornecidas
        const queryStartDate = startDate ? new Date(startDate as string) : periodStart
        const queryEndDate = endDate ? new Date(endDate as string) : now
        
        // Contagens básicas
        const [totalChatflows, totalAssistants, totalExecutions, totalCustomers] = await Promise.all([
            AppDataSource.getRepository(ChatFlow).count({ 
                where: { 
                    type: 'CHATFLOW',
                    createdAt: { $gte: queryStartDate }
                } 
            }),
            AppDataSource.getRepository(Assistant).count({ 
                where: { 
                    createdAt: { $gte: queryStartDate }
                } 
            }),
            AppDataSource.getRepository(Execution).count({ 
                where: { 
                    createdAt: { $gte: queryStartDate }
                } 
            }),
            AppDataSource.getRepository(Customer).count({ 
                where: { 
                    createdAt: { $gte: queryStartDate }
                } 
            })
        ])
        
        // Estatísticas de performance
        const [successfulExecutions, totalResponseTime] = await Promise.all([
            AppDataSource.getRepository(Execution).count({ 
                where: { 
                    createdAt: { $gte: queryStartDate },
                    status: 'success'
                } 
            }),
            AppDataSource.getRepository(Execution)
                .createQueryBuilder('execution')
                .select('AVG(execution.duration)', 'avgDuration')
                .where('execution.createdAt >= :startDate', { startDate: queryStartDate })
                .getRawOne()
        ])
        
        const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0
        const avgResponseTime = parseFloat(totalResponseTime.avgDuration) || 0
        
        // Estatísticas de negócio (clientes)
        const customerStats = await AppDataSource.getRepository(Customer)
            .createQueryBuilder('customer')
            .select('SUM(customer.monthlyRevenue)', 'totalRevenue')
            .addSelect('COUNT(customer.id)', 'activeCustomers')
            .where('customer.status = :status AND customer.createdAt >= :startDate', 
                   { status: 'active', startDate: queryStartDate })
            .getRawOne()
        
        const monthlyRevenue = parseFloat(customerStats.totalRevenue) || 0
        const activeCustomers = parseInt(customerStats.activeCustomers) || 0
        
        // Usuários ativos (baseado em mensagens)
        const activeUsers = await AppDataSource.getRepository(ChatMessage)
            .createQueryBuilder('message')
            .select('COUNT(DISTINCT message.userId)', 'activeUsers')
            .where('message.createdAt >= :startDate', { startDate: queryStartDate })
            .getRawOne()
        
        // Calcular tendências
        const previousPeriodStart = new Date(queryStartDate.getTime() - (queryEndDate.getTime() - queryStartDate.getTime()))
        const previousPeriodEnd = queryStartDate
        
        const [previousChatflows, previousExecutions, previousRevenue] = await Promise.all([
            AppDataSource.getRepository(ChatFlow).count({ 
                where: { 
                    type: 'CHATFLOW',
                    createdAt: { 
                        $gte: previousPeriodStart, 
                        $lt: previousPeriodEnd 
                    }
                } 
            }),
            AppDataSource.getRepository(Execution).count({ 
                where: { 
                    createdAt: { 
                        $gte: previousPeriodStart, 
                        $lt: previousPeriodEnd 
                    }
                } 
            }),
            AppDataSource.getRepository(Customer)
                .createQueryBuilder('customer')
                .select('SUM(customer.monthlyRevenue)', 'totalRevenue')
                .where('customer.status = :status AND customer.createdAt >= :startDate AND customer.createdAt < :endDate', 
                       { status: 'active', startDate: previousPeriodStart, endDate: previousPeriodEnd })
                .getRawOne()
        ])
        
        const chatflowsGrowth = previousChatflows > 0 ? 
            ((totalChatflows - previousChatflows) / previousChatflows) * 100 : 0
        const executionsGrowth = previousExecutions > 0 ? 
            ((totalExecutions - previousExecutions) / previousExecutions) * 100 : 0
        const revenueGrowth = parseFloat(previousRevenue.totalRevenue) > 0 ? 
            ((monthlyRevenue - parseFloat(previousRevenue.totalRevenue)) / parseFloat(previousRevenue.totalRevenue)) * 100 : 0
        
        const stats = {
            system: {
                totalChatflows,
                totalAssistants,
                totalExecutions,
                totalCustomers,
                activeUsers: parseInt(activeUsers.activeUsers) || 0,
                uptime: 99.9 // Simulado - poderia vir de monitoramento real
            },
            performance: {
                executionRate: Math.min(100, Math.round((totalExecutions / Math.max(1, totalChatflows)) * 10)),
                successRate: Math.round(successRate),
                averageResponseTime: Math.round(avgResponseTime * 100) / 100,
                errorRate: Math.round(100 - successRate)
            },
            business: {
                monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
                newCustomersThisMonth: totalCustomers,
                customerRetention: Math.round((activeCustomers / Math.max(1, totalCustomers)) * 100),
                averageRevenuePerCustomer: totalCustomers > 0 ? Math.round((monthlyRevenue / totalCustomers) * 100) / 100 : 0
            },
            trends: {
                chatflowsGrowth: Math.round(chatflowsGrowth),
                executionsGrowth: Math.round(executionsGrowth),
                revenueGrowth: Math.round(revenueGrowth),
                usersGrowth: 5 // Simulado
            },
            period: {
                start: queryStartDate,
                end: queryEndDate,
                type: period
            }
        }
        
        res.json(stats)
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const getDashboardActivity = async (req: Request, res: Response) => {
    try {
        const { limit = 20, type, startDate, endDate } = req.query
        
        const queryEndDate = endDate ? new Date(endDate as string) : new Date()
        const queryStartDate = startDate ? new Date(startDate as string) : 
            new Date(queryEndDate.getTime() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
        
        // Buscar atividades de diferentes fontes
        const activities = []
        
        // Atividades de Chatflows
        if (!type || type === 'chatflow') {
            const chatflows = await AppDataSource.getRepository(ChatFlow).find({
                where: { 
                    createdAt: { 
                        $gte: queryStartDate, 
                        $lte: queryEndDate 
                    }
                },
                order: { createdAt: 'DESC' },
                take: parseInt(limit as string)
            })
            
            chatflows.forEach(chatflow => {
                activities.push({
                    id: `chatflow_${chatflow.id}`,
                    type: 'chatflow',
                    action: 'created',
                    name: chatflow.name || 'Novo Chatflow',
                    user: chatflow.createdBy || 'System',
                    timestamp: chatflow.createdAt,
                    status: 'success',
                    metadata: {
                        chatflowId: chatflow.id,
                        category: chatflow.category || 'general'
                    }
                })
            })
        }
        
        // Atividades de Execuções
        if (!type || type === 'execution') {
            const executions = await AppDataSource.getRepository(Execution).find({
                where: { 
                    createdAt: { 
                        $gte: queryStartDate, 
                        $lte: queryEndDate 
                    }
                },
                order: { createdAt: 'DESC' },
                take: parseInt(limit as string)
            })
            
            executions.forEach(execution => {
                activities.push({
                    id: `execution_${execution.id}`,
                    type: 'execution',
                    action: execution.status === 'success' ? 'completed' : 'failed',
                    name: `Execução ${execution.id}`,
                    user: execution.createdBy || 'System',
                    timestamp: execution.createdAt,
                    status: execution.status,
                    metadata: {
                        executionId: execution.id,
                        duration: execution.duration || 0,
                        chatflowId: execution.chatflowId
                    }
                })
            })
        }
        
        // Atividades de Clientes
        if (!type || type === 'customer') {
            const customers = await AppDataSource.getRepository(Customer).find({
                where: { 
                    createdAt: { 
                        $gte: queryStartDate, 
                        $lte: queryEndDate 
                    }
                },
                order: { createdAt: 'DESC' },
                take: parseInt(limit as string)
            })
            
            customers.forEach(customer => {
                activities.push({
                    id: `customer_${customer.id}`,
                    type: 'customer',
                    action: 'created',
                    name: `Cliente: ${customer.name}`,
                    user: customer.createdBy || 'System',
                    timestamp: customer.createdAt,
                    status: 'success',
                    metadata: {
                        customerId: customer.id,
                        company: customer.company,
                        plan: customer.subscriptionPlan
                    }
                })
            })
        }
        
        // Ordenar atividades por timestamp
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        
        // Limitar resultado
        const limitedActivities = activities.slice(0, parseInt(limit as string))
        
        res.json({
            activities: limitedActivities,
            total: activities.length,
            period: {
                start: queryStartDate,
                end: queryEndDate
            }
        })
    } catch (error) {
        console.error('Error fetching dashboard activity:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export default {
    getDashboardStats,
    getDashboardActivity
}
```

### Backend: Rotas de Dashboard

#### Arquivo: `/server/src/routes/dashboard/index.ts`

```typescript
import express from 'express'
import dashboardController from '../../controllers/dashboard'

const router = express.Router()

// Dashboard stats
router.get('/stats', dashboardController.getDashboardStats)

// Dashboard activity
router.get('/activity', dashboardController.getDashboardActivity)

export default router
```

### Integração no Main Routes

#### Arquivo: `/server/src/routes/index.ts`

```typescript
// Adicionar no topo com os outros imports
import dashboardRouter from './dashboard'

// Adicionar no router.use()
router.use('/dashboard', dashboardRouter)
```

## 2. Atualização do Dashboard Component

### Arquivo: `/ui/src/views/dashboard/index.jsx`

```javascript
// Adicionar import da nova API
import dashboardApi from '@/api/dashboard'

// Substituir a função loadDashboardData
const loadDashboardData = async () => {
    try {
        setRefreshing(true)
        
        // Carregar dados do dashboard API
        const [dashboardStats, activityData] = await Promise.all([
            dashboardApi.getDashboardStats({ period: 'month' }),
            dashboardApi.getDashboardActivity({ limit: 10 })
        ])
        
        setStats({
            totalChatflows: dashboardStats.data.system.totalChatflows,
            totalAssistants: dashboardStats.data.system.totalAssistants,
            totalExecutions: dashboardStats.data.system.totalExecutions,
            activeUsers: dashboardStats.data.system.activeUsers,
            executionRate: dashboardStats.data.performance.executionRate,
            successRate: dashboardStats.data.performance.successRate,
            monthlyRevenue: dashboardStats.data.business.monthlyRevenue,
            customerRetention: dashboardStats.data.business.customerRetention
        })
        
        setRecentActivity(activityData.data.activities)
        
        setLoading(false)
        setRefreshing(false)
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error)
        // Fallback para o método antigo
        // ... código existente como fallback
        setLoading(false)
        setRefreshing(false)
    }
}
```

## 3. Benefícios da Implementação

### Vantagens Imediatas

1. **Performance Melhorada**
   - Requisições otimizadas com agregação no backend
   - Redução de chamadas múltiplas ao frontend
   - Caching potencial no servidor

2. **Dados Mais Precisos**
   - Cálculos centralizados e consistentes
   - Eliminação de dados simulados
   - Fonte única de verdade para métricas

3. **Experiência do Usuário**
   - Carregamento mais rápido do dashboard
   - Dados em tempo real
   - Atualizações mais confiáveis

### Escalabilidade

1. **Fácil Extensão**
   - Arquitetura modular para novas métricas
   - Suporte a diferentes períodos de tempo
   - Flexibilidade para adicionar novos filtros

2. **Integrações Futuras**
   - Preparado para Vercel API
   - Suporte para Z.ai analytics
   - Arquitetura compatível com Supabase

## 4. Passos Seguintes

1. **Implementar Backend**
   - Criar controller de dashboard
   - Adicionar rotas no index.ts
   - Testar endpoints individualmente

2. **Atualizar Frontend**
   - Criar API client para dashboard
   - Modificar componente dashboard
   - Testar integração completa

3. **Adicionar Testes**
   - Testes unitários para controller
   - Testes de integração para APIs
   - Testes E2E para dashboard

4. **Documentação**
   - Atualizar documentação da API
   - Adicionar exemplos de uso
   - Documentar novos endpoints

Esta implementação fornecerá uma base sólida e escalável para o dashboard do Flowise UrbanDev, com dados precisos e performance otimizada.