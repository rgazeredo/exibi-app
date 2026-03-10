# Análise: Exibi - Alternativa Simplificada ao Exibi

## Contexto

Este documento propõe o escopo de funcionalidades para o **Exibi**, uma versão simplificada e mais acessível de plataforma de sinalização digital, voltada para clientes iniciantes no mercado de mídia indoor.

**Posicionamento:**

- **Exibi**: Solução completa e robusta para clientes experientes
- **Exibi**: Solução simples e acessível para quem está começando

---

## Princípios do Exibi

1. **Simplicidade acima de tudo** - Interface limpa, sem opções avançadas
2. **Configuração rápida** - Do cadastro até a primeira exibição em minutos
3. **Preço acessível** - Custo reduzido para viabilizar entrada no mercado
4. **Escalabilidade** - Caminho natural de upgrade para Exibi quando crescer

---

## Funcionalidades Recomendadas

### ✅ MANTER (Essenciais)

#### 1. Players

- Cadastro de players com nome
- Ativação por código de 6 dígitos
- Status online/offline
- Configuração de orientação (paisagem/retrato)

**Simplificação:** Remover favoritos, descrição detalhada, configurações avançadas.

#### 2. Biblioteca de Mídia

- Upload de vídeos e imagens
- Visualização em grid
- Exclusão de mídias
- Geração automática de thumbnail

**Simplificação:** Sem tags, sem metadados avançados, sem upload em lote.

#### 3. Playlists

- Criação de playlist com nome
- Adicionar/remover mídias
- Ordenação por drag-and-drop
- Definir duração de imagens

**Simplificação:** Sem ativação/desativação, sem descrição, duração fixa global.

#### 4. Associação Player ↔ Playlist

- Cada player tem UMA playlist vinculada diretamente
- Troca simples de playlist no player

**Simplificação:** Sem layouts, sem regiões, sem agendamento.

#### 5. Aplicativo Android TV

- Reprodução de vídeos e imagens
- Download para cache local
- Sincronização automática
- Funcionamento offline

**Simplificação:** Sem widgets, sem múltiplas regiões.

#### 6. Conta e Autenticação

- Login com email/senha
- Recuperação de senha
- Perfil básico (nome, email)

**Simplificação:** Sem 2FA, sem sessões, sem histórico.

#### 7. Dashboard Simples

- Total de players (online/offline)
- Total de mídias
- Lista dos últimos players atualizados

**Simplificação:** Sem gráficos, sem analytics detalhado.

---

### ❌ REMOVER (Complexidade Desnecessária)

#### 1. Multi-Tenancy

- **No Exibi:** Cada conta é independente (single-tenant)
- **Motivo:** Simplifica arquitetura, reduz custos, público-alvo não precisa

#### 2. Grupos de Players

- **No Exibi:** Cada player é configurado individualmente
- **Motivo:** Clientes iniciantes têm poucos players (1-5)

#### 3. Layouts e Regiões

- **No Exibi:** Tela cheia apenas
- **Motivo:** Layouts complexos são para operações avançadas

#### 4. Agendamento de Conteúdo

- **No Exibi:** Playlist fixa, troca manual
- **Motivo:** Agendamento exige planejamento que iniciantes não têm

#### 5. Horário de Funcionamento

- **No Exibi:** Player sempre ligado
- **Motivo:** Adiciona complexidade, pode ser controlado no timer da TV

#### 6. Widgets

- **No Exibi:** Apenas mídia (vídeo/imagem)
- **Motivo:** Requer integrações externas, aumenta manutenção

#### 7. Sistema de Tags

- **No Exibi:** Sem tags
- **Motivo:** Organização simples por nome é suficiente para poucos arquivos

#### 8. Múltiplos Usuários

- **No Exibi:** Uma conta = um usuário
- **Motivo:** Negócios iniciantes são operados pelo próprio dono

#### 9. Papéis e Permissões

- **No Exibi:** Todos os recursos disponíveis
- **Motivo:** Sem múltiplos usuários, não há necessidade

#### 10. Logs de Reprodução

- **No Exibi:** Sem registro de reprodução
- **Motivo:** Reduz armazenamento, clientes iniciantes não analisam métricas

#### 11. API Pública

- **No Exibi:** Apenas API interna para o app
- **Motivo:** Integrações são para operações maduras

---

## Arquitetura Simplificada

### Banco de Dados (Tabelas Essenciais)

```
users
├── id, name, email, password, created_at

players
├── id, user_id, name, orientation, api_token
├── playlist_id (FK), is_online, last_seen_at

media
├── id, user_id, title, type, file_path
├── thumbnail_path, duration_seconds, size_bytes

playlists
├── id, user_id, name, default_duration

playlist_media
├── id, playlist_id, media_id, position, duration
```

**Total: 5 tabelas** (vs ~15+ no Exibi)

### Endpoints da API

```
POST /api/activate          # Ativar player
GET  /api/player/playlist   # Buscar playlist
POST /api/player/heartbeat  # Reportar status
```

**Total: 3 endpoints** (vs 10+ no Exibi)

---

## Interface do Usuário

### Telas Necessárias

1. **Login/Cadastro**
2. **Dashboard** (visão geral simples)
3. **Players** (lista + cadastro)
4. **Mídias** (biblioteca + upload)
5. **Playlists** (lista + editor)
6. **Configurações** (perfil básico)

**Total: 6 telas principais** (vs 15+ no Exibi)

### Fluxo do Usuário

```
1. Cadastra conta
2. Faz upload de mídias
3. Cria playlist
4. Cadastra player
5. Ativa player na TV
6. Player exibe conteúdo
```

**Tempo estimado:** 10-15 minutos para primeira exibição

---

## Modelo de Preço Sugerido

### Plano Único (Starter)

- Até 3 players
- 5 GB de armazenamento
- Suporte por email
- **R$ 49/mês** ou **R$ 490/ano**

### Plano Growth

- Até 10 players
- 20 GB de armazenamento
- Suporte prioritário
- **R$ 99/mês** ou **R$ 990/ano**

### Upgrade para Exibi

- Cliente ultrapassa limites → oferta de migração
- Dados transferidos automaticamente
- Desconto no primeiro ano

---

## Comparativo: Exibi vs Exibi

| Funcionalidade        | Exibi       | Exibi     |
| --------------------- | ----------- | --------- |
| Players               | Ilimitado\* | Ilimitado |
| Grupos de Players     | ❌          | ✅        |
| Upload de Mídia       | ✅          | ✅        |
| Tags                  | ❌          | ✅        |
| Playlists             | ✅          | ✅        |
| Layouts/Regiões       | ❌          | ✅        |
| Agendamento           | ❌          | ✅        |
| Widgets               | ❌          | ✅        |
| Multi-usuário         | ❌          | ✅        |
| Multi-tenant          | ❌          | ✅        |
| Analytics             | Básico      | Completo  |
| Horário Funcionamento | ❌          | ✅        |
| API Pública           | ❌          | ✅        |
| Preço Inicial         | R$ 49       | R$ 199    |

\*Limitado pelo plano

---

## Benefícios Estratégicos

### Para o Negócio

1. **Captura mercado de entrada** - Clientes que não pagariam Exibi
2. **Funil de upgrade** - Crescem no Exibi, migram para Exibi
3. **Menor custo de suporte** - Sistema mais simples = menos dúvidas
4. **Desenvolvimento rápido** - Menos features = entrega mais rápida

### Para o Cliente

1. **Baixa barreira de entrada** - Preço acessível
2. **Curva de aprendizado curta** - Interface simples
3. **Resultado imediato** - Funciona em minutos
4. **Caminho de evolução** - Upgrade quando precisar

---

## Roadmap de Implementação

### Fase 1: MVP (4-6 semanas)

- [ ] Autenticação básica
- [ ] CRUD de players
- [ ] CRUD de mídias
- [ ] CRUD de playlists
- [ ] App Android básico
- [ ] Landing page

### Fase 2: Polimento (2-3 semanas)

- [ ] Dashboard
- [ ] Melhorias de UX
- [ ] Onboarding guiado
- [ ] Documentação/FAQ

### Fase 3: Lançamento

- [ ] Integração de pagamento
- [ ] Sistema de planos
- [ ] Marketing inicial

---

## Recomendações Técnicas

### Stack Sugerida

- **Backend:** Laravel (mesmo do Exibi, reusa conhecimento)
- **Frontend:** React + Inertia (mesmo do Exibi)
- **Database:** PostgreSQL ou MySQL
- **Storage:** S3/MinIO
- **App:** Android TV (fork simplificado do Exibi)

### Reutilização do Exibi

- Componentes UI base
- Sistema de upload
- Processamento de mídia
- App Android (versão simplificada)

### Isolamento

- Repositório separado
- Infraestrutura independente
- Marca/domínio próprio

---

## Conclusão

O Exibi representa uma oportunidade de:

1. Capturar clientes que não podem/querem pagar pelo Exibi
2. Validar o mercado com investimento menor
3. Criar um funil natural de upgrade
4. Reduzir complexidade para clientes iniciantes

A chave do sucesso está em **resistir à tentação de adicionar features**. O diferencial é a simplicidade, não a quantidade de funcionalidades.

**Mantra:** "Se o cliente precisa de mais, ele está pronto para o Exibi."
