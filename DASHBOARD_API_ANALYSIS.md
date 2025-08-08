# Análise de APIs REST para Dashboard - Flowise UrbanDev

## Visão Geral

Este documento apresenta uma análise detalhada das APIs REST disponíveis para alimentar o dashboard do Flowise UrbanDev, identificando endpoints existentes, lacunas e oportunidades de melhoria.

## APIs Atuais Disponíveis

### 1. Chatflows API (`/api/v1/chatflows`)

**Endpoints Principais:**
- `GET /chatflows?type=CHATFLOW` - Lista todos os chatflows
- `GET /chatflows/{id}` - Obtém chatflow específico
- `POST /chatflows` - Cria novo chatflow
- `PUT /chatflows/{id}` - Atualiza chatflow
- `DELETE /chatflows/{id}` - Exclui chatflow

**Utilidade no Dashboard:**
- ✅ **Total de Chatflows**: Contagem via `getAllChatflows`
- ✅ **Crescimento**: Comparação de períodos
- ✅ **Atividade Recente**: Monitoramento de criações/atualizações

**Limitações:**
- ❌ Não possui endpoint específico para estatísticas agregadas
- ❌ Não filtra por período de data
- ❌ Não retorna métricas de uso/performance

### 2. Assistants API (`/api/v1/assistants`)

**Endpoints Principais:**
- `GET /assistants?type={type}` - Lista assistentes por tipo
- `GET /assistants/{id}` - Obtém assistente específico
- `POST /assistants` - Cria novo assistente
- `PUT /assistants/{id}` - Atualiza assistente
- `DELETE /assistants/{id}` - Exclui assistente

**Utilidade no Dashboard:**
- ✅ **Total de Assistentes**: Contagem por tipo
- ✅ **Distribuição por Tipo**: OpenAI vs Custom
- ✅ **Atividade de Criação**: Tendências de uso

**Limitações:**
- ❌ Não possui estatísticas de uso dos assistentes
- ❌ Não métricas de performance ou sucesso

### 3. Executions API (`/api/v1/executions`)

**Endpoints Principais:**
- `GET /executions` - Lista todas as execuções com paginação
- `GET /executions/{id}` - Obtém execução específica
- `PUT /executions/{id}` - Atualiza execução
- `DELETE /executions` - Exclui múltiplas execuções

**Utilidade no Dashboard:**
- ✅ **Total de Execuções**: Contagem geral
- ✅ **Taxa de Execução**: Cálculo baseado em chatflows vs execuções
- ✅ **Atividade Recente**: Monitoramento em tempo real

**Limitações:**
- ❌ Não possui estatísticas agregadas
- ❌ Não filtra por status (sucesso/falha)
- ❌ Não retorna métricas de performance (tempo, tokens, etc.)

### 4. Customers API (`/api/v1/customers`)

**Endpoints Principais:**
- `GET /customers` - Lista todos os clientes
- `GET /customers/{id}` - Obtém cliente específico
- `GET /customers/{id}/details` - Obtém detalhes do cliente
- `GET /customers/stats` - Obtém estatísticas de clientes
- `POST /customers` - Cria novo cliente
- `PUT /customers/{id}` - Atualiza cliente
- `DELETE /customers/{id}` - Exclui cliente

**Utilidade no Dashboard:**
- ✅ **Total de Clientes**: Disponível via stats
- ✅ **Clientes Ativos**: Filtragem por status
- ✅ **Receita Mensal**: Agregação de revenue
- ✅ **Novos Clientes**: Contagem por período

**Vantagens:**
- ✅ Possui endpoint dedicado para estatísticas
- ✅ Retorna métricas de negócio importantes
- ✅ Suporta agregações por período

### 5. Stats API (`/api/v1/stats`)

**Endpoints Principais:**
- `GET /stats/{id}` - Obtém estatísticas de um chatflow específico

**Utilidade no Dashboard:**
- ⚠️ **Limitado**: Apenas para chatflows individuais
- ❌ Não possui estatísticas globais do sistema

**Limitações:**
- ❌ Não possui endpoint para estatísticas agregadas do dashboard
- ❌ Focado apenas em chatflows individuais
- ❌ Não retorna métricas de sistema

## APIs Faltantes para Dashboard Completo

### 1. Dashboard Stats API (Necessária)

**Endpoint Proposto:** `GET /api/v1/dashboard/stats`

**Resposta Esperada:**
```json
{
  "system": {
    "totalChatflows": 45,
    "totalAssistants": 12,
    "totalExecutions": 1250,
    "totalCustomers": 28,
    "totalUsers": 15,
    "uptime": "99.9%"
  },
  "performance": {
    "executionRate": 85,
    "successRate": 94,
    "averageResponseTime": 1.2,
    "errorRate": 6
  },
  "business": {
    "monthlyRevenue": 4500,
    "newCustomersThisMonth": 5,
    "customerRetention": 92,
    "averageRevenuePerCustomer": 160
  },
  "activity": {
    "activeUsers24h": 8,
    "executionsToday": 45,
    "chatflowsCreatedThisWeek": 3,
    "lastActivity": "2024-01-15T10:30:00Z"
  },
  "trends": {
    "chatflowsGrowth": 12,
    "executionsGrowth": 25,
    "revenueGrowth": 8,
    "usersGrowth": 5
  }
}
```

### 2. Activity Timeline API (Necessária)

**Endpoint Proposto:** `GET /api/v1/dashboard/activity`

**Parâmetros:**
- `limit`: número de itens (default: 20)
- `type`: filtro por tipo (chatflow, execution, customer, user, assistant)
- `startDate`: data inicial
- `endDate`: data final

**Resposta Esperada:**
```json
{
  "activities": [
    {
      "id": "1",
      "type": "chatflow",
      "action": "created",
      "name": "Novo chatbot de suporte",
      "user": "João Silva",
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "success",
      "metadata": {
        "chatflowId": "123",
        "category": "support"
      }
    },
    {
      "id": "2",
      "type": "execution",
      "action": "completed",
      "name": "Execução de fluxo de vendas",
      "user": "Maria Santos",
      "timestamp": "2024-01-15T10:25:00Z",
      "status": "success",
      "metadata": {
        "executionId": "456",
        "duration": 2.5,
        "tokensUsed": 150
      }
    }
  ]
}
```

### 3. Analytics API (Necessária)

**Endpoint Proposto:** `GET /api/v1/dashboard/analytics`

**Parâmetros:**
- `period`: day, week, month, year
- `metric`: chatflows, executions, users, revenue

**Resposta Esperada:**
```json
{
  "period": "month",
  "metrics": {
    "chatflows": {
      "current": 45,
      "previous": 40,
      "growth": 12.5,
      "timeline": [
        { "date": "2024-01-01", "value": 40 },
        { "date": "2024-01-08", "value": 42 },
        { "date": "2024-01-15", "value": 45 }
      ]
    },
    "executions": {
      "current": 1250,
      "previous": 1000,
      "growth": 25,
      "timeline": [
        { "date": "2024-01-01", "value": 1000 },
        { "date": "2024-01-08", "value": 1150 },
        { "date": "2024-01-15", "value": 1250 }
      ]
    }
  }
}
```

### 4. System Health API (Opcional)

**Endpoint Proposto:** `GET /api/v1/dashboard/health`

**Resposta Esperada:**
```json
{
  "status": "healthy",
  "components": {
    "database": "healthy",
    "api": "healthy",
    "storage": "healthy",
    "external_apis": "degraded"
  },
  "metrics": {
    "cpu_usage": 45,
    "memory_usage": 67,
    "disk_usage": 82,
    "response_time": 120
  },
  "last_check": "2024-01-15T10:30:00Z"
}
```

## Integrações Externas Necessárias

### 1. Vercel Analytics API

**Finalidade:** Métricas de performance e uso da aplicação
**Endpoints Necessários:**
- Deployments statistics
- Bandwidth usage
- Response times
- Error rates

### 2. Z.ai API

**Finalidade:** Métricas de uso de IA e custos
**Endpoints Necessários:**
- Token usage
- API calls
- Cost analysis
- Model performance

### 3. Supabase API

**Finalidade:** Banco de dados e autenticação
**Endpoints Necessários:**
- User activity
- Database performance
- Authentication events

## Recomendações de Implementação

### Fase 1: APIs Internas (Prioridade Alta)

1. **Criar Dashboard Stats API**
   - Agregar dados de APIs existentes
   - Implementar caching para performance
   - Adicionar filtros por período

2. **Implementar Activity Timeline API**
   - Utilizar sistema de logs existente
   - Integrar com eventos do sistema
   - Adicionar paginação e filtros

3. **Melhorar APIs Existentes**
   - Adicionar endpoints de estatísticas ao chatflows
   - Implementar métricas de performance nas execuções
   - Expandir customers API com mais agregações

### Fase 2: Integrações Externas (Prioridade Média)

1. **Vercel Integration**
   - Configurar webhooks para eventos de deploy
   - Implementar coleta de métricas de performance
   - Criar dashboard de monitoramento

2. **Z.ai Integration**
   - Implementar tracking de uso de tokens
   - Adicionar análise de custos
   - Criar alertas de uso excessivo

### Fase 3: Analytics Avançado (Prioridade Baixa)

1. **Analytics API**
   - Implementar armazenamento de séries temporais
   - Adicionar visualizações de tendências
   - Criar relatórios personalizados

2. **System Health Monitoring**
   - Implementar monitoramento de componentes
   - Adicionar alertas automáticos
   - Criar dashboard de saúde do sistema

## Conclusão

O sistema atual possui boas APIs fundamentais (chatflows, assistants, executions, customers) mas carece de endpoints específicos para dashboard. A implementação das APIs propostas na Fase 1 proporcionará uma base sólida para um dashboard completo e funcional, enquanto as integrações externas adicionarão camadas avançadas de monitoramento e analytics.

As APIs existentes já cobrem aproximadamente 60% das necessidades do dashboard, mas as APIs propostas elevarão essa cobertura para 95%, permitindo uma experiência completa de monitoramento e análise do sistema.