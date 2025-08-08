const express = require('express')
const cors = require('cors')
const path = require('path')

// Criar app Express
const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rotas básicas para teste do Dashboard
app.get('/api/v1/dashboard/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            overview: {
                totalChatflows: 15,
                totalAssistants: 8,
                totalExecutions: 1247,
                totalCustomers: 23,
                activeUsers: 45
            },
            performance: {
                successRate: 96.5,
                averageResponseTime: 1.2,
                errorRate: 3.5,
                uptime: 99.9
            },
            business: {
                revenue: 12500.00,
                customerRetention: 85.5,
                growthRate: 12.3,
                conversionRate: 3.2
            }
        },
        timestamp: new Date().toISOString()
    })
})

app.get('/api/v1/dashboard/activity/recent', (req, res) => {
    res.json({
        success: true,
        data: {
            activities: [
                {
                    id: '1',
                    type: 'chatflow',
                    action: 'created',
                    description: 'Novo chatbot de suporte criado',
                    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
                    user: 'João Silva'
                },
                {
                    id: '2',
                    type: 'execution',
                    action: 'executed',
                    description: 'Execução de fluxo de vendas',
                    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                    user: 'Maria Santos'
                },
                {
                    id: '3',
                    type: 'customer',
                    action: 'created',
                    description: 'Novo cliente cadastrado',
                    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                    user: 'Pedro Oliveira'
                },
                {
                    id: '4',
                    type: 'assistant',
                    action: 'updated',
                    description: 'Assistente de IA atualizado',
                    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                    user: 'Ana Costa'
                },
                {
                    id: '5',
                    type: 'execution',
                    action: 'executed',
                    description: 'Falha na execução do fluxo',
                    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
                    user: 'Carlos Silva'
                }
            ]
        },
        timestamp: new Date().toISOString()
    })
})

app.get('/api/v1/dashboard/analytics', (req, res) => {
    res.json({
        success: true,
        data: {
            period: '7d',
            metrics: {
                executions: 342,
                users: 89,
                chatflows: 12,
                customers: 5,
                revenue: 2500.00
            },
            trends: [
                { date: '2025-08-01', executions: 45, users: 12, revenue: 350 },
                { date: '2025-08-02', executions: 52, users: 15, revenue: 420 },
                { date: '2025-08-03', executions: 38, users: 11, revenue: 310 },
                { date: '2025-08-04', executions: 67, users: 18, revenue: 580 },
                { date: '2025-08-05', executions: 49, users: 14, revenue: 390 },
                { date: '2025-08-06', executions: 58, users: 16, revenue: 450 },
                { date: '2025-08-07', executions: 33, users: 13, revenue: 400 }
            ]
        },
        timestamp: new Date().toISOString()
    })
})

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'packages/ui/build')))

// Rota principal para o Dashboard
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>UrbanDev Dashboard</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #333;
                    margin-bottom: 10px;
                }
                .header p {
                    color: #666;
                    font-size: 18px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    border-left: 4px solid #007bff;
                }
                .stat-card h3 {
                    margin: 0 0 10px 0;
                    color: #333;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .stat-card .value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                }
                .api-section {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .api-section h2 {
                    margin-top: 0;
                    color: #333;
                }
                .api-endpoint {
                    background: #e9ecef;
                    padding: 10px;
                    border-radius: 4px;
                    font-family: monospace;
                    margin: 10px 0;
                }
                .status {
                    display: inline-block;
                    padding: 5px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .status.running {
                    background: #d4edda;
                    color: #155724;
                }
                .btn {
                    display: inline-block;
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 5px;
                }
                .btn:hover {
                    background: #0056b3;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚀 UrbanDev Dashboard</h1>
                    <p>Plataforma de Desenvolvimento Inteligente</p>
                    <span class="status running">● Servidor Rodando</span>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Total Chatflows</h3>
                        <div class="value">15</div>
                    </div>
                    <div class="stat-card">
                        <h3>Assistentes</h3>
                        <div class="value">8</div>
                    </div>
                    <div class="stat-card">
                        <h3>Execuções</h3>
                        <div class="value">1,247</div>
                    </div>
                    <div class="stat-card">
                        <h3>Clientes</h3>
                        <div class="value">23</div>
                    </div>
                    <div class="stat-card">
                        <h3>Usuários Ativos</h3>
                        <div class="value">45</div>
                    </div>
                    <div class="stat-card">
                        <h3>Taxa de Sucesso</h3>
                        <div class="value">96.5%</div>
                    </div>
                </div>

                <div class="api-section">
                    <h2>📡 APIs Disponíveis</h2>
                    <div class="api-endpoint">GET /api/v1/dashboard/stats</div>
                    <div class="api-endpoint">GET /api/v1/dashboard/activity/recent</div>
                    <div class="api-endpoint">GET /api/v1/dashboard/analytics</div>
                </div>

                <div class="api-section">
                    <h2>🔗 Links Úteis</h2>
                    <a href="/api/v1/dashboard/stats" class="btn">Ver Estatísticas</a>
                    <a href="/api/v1/dashboard/activity/recent" class="btn">Ver Atividades</a>
                    <a href="/api/v1/dashboard/analytics" class="btn">Ver Analytics</a>
                </div>

                <div class="api-section">
                    <h2>✅ Integrações</h2>
                    <p><strong>Supabase:</strong> Configurado e pronto para uso</p>
                    <p><strong>Dashboard APIs:</strong> Implementadas e funcionando</p>
                    <p><strong>Frontend:</strong> React + Material-UI (atualizado)</p>
                    <p><strong>Backend:</strong> Node.js + Express + TypeScript</p>
                </div>
            </div>
        </body>
        </html>
    `)
})

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 UrbanDev Dashboard rodando na porta ${PORT}`)
    console.log(`📡 Acesse: http://localhost:${PORT}`)
    console.log(`📊 API Stats: http://localhost:${PORT}/api/v1/dashboard/stats`)
    console.log(`🕐 API Activity: http://localhost:${PORT}/api/v1/dashboard/activity/recent`)
    console.log(`📈 API Analytics: http://localhost:${PORT}/api/v1/dashboard/analytics`)
})

module.exports = app