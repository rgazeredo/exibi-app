# Exibi - Documentação de Funcionalidades

## Visão Geral

Exibi é uma plataforma completa de sinalização digital (digital signage) que permite gerenciar conteúdo exibido em TVs e displays. O sistema é composto por um painel administrativo web e um aplicativo para Android TV.

---

## 1. Gerenciamento de Players (Dispositivos)

### Cadastro e Configuração
- Cadastro de players com nome, descrição e código de ativação
- Ativação de dispositivos via código de 6 dígitos
- Configuração individual de orientação da tela (paisagem/retrato)
- Definição de volume do player
- Marcação de players como favoritos para acesso rápido

### Agrupamento
- Organização de players em grupos
- Herança de configurações do grupo (layout, configurações, horário de funcionamento)
- Possibilidade de personalizar configurações individualmente por player
- Contagem de players por grupo

### Status e Monitoramento
- Visualização do status online/offline em tempo real
- Indicador de "última vez visto" (last seen)
- Detecção automática de inatividade
- Sistema de heartbeat para monitoramento contínuo

---

## 2. Grupos de Players

### Configuração de Grupos
- Criação de grupos com nome e descrição
- Definição de layout padrão para todos os players do grupo
- Configurações compartilhadas (volume, orientação)
- Contagem automática de players vinculados

### Horário de Funcionamento
- Configuração de horário de ligar/desligar por dia da semana
- Possibilidade de marcar dias como "fechado"
- Herança para todos os players do grupo
- Override individual por player quando necessário

---

## 3. Biblioteca de Mídia

### Upload e Armazenamento
- Upload de vídeos (MP4, WebM, etc.)
- Upload de imagens (JPG, PNG, GIF, WebP)
- Upload em lote de múltiplos arquivos
- Processamento automático em background
- Geração automática de thumbnails
- Armazenamento em nuvem (S3/MinIO)

### Metadados
- Extração automática de duração de vídeos
- Detecção de resolução
- Cálculo de tamanho do arquivo
- Suporte a títulos e descrições
- Sistema de tags para organização

### Organização
- Busca por nome/título
- Filtro por tipo (vídeo/imagem)
- Filtro por tags
- Visualização em grid ou lista
- Preview de mídia

---

## 4. Playlists

### Criação e Edição
- Nome e descrição da playlist
- Adição de múltiplas mídias
- Ordenação por drag-and-drop
- Definição de duração individual para imagens
- Ativação/desativação de playlist

### Configurações
- Duração padrão para imagens (em segundos)
- Modo de transição entre mídias
- Contagem de itens na playlist
- Cálculo automático da duração total

---

## 5. Layouts e Regiões

### Editor de Layouts
- Criação de layouts com múltiplas regiões
- Posicionamento livre de regiões (X, Y em porcentagem)
- Dimensionamento de regiões (largura, altura)
- Suporte a orientação paisagem e retrato
- Preview visual em tempo real

### Regiões
- Nomeação de cada região
- Atribuição de playlist por região
- Configuração de escala (aspect fit, fill, stretch)
- Z-index para sobreposição
- Opção de overlay entre regiões

### Tipos de Conteúdo por Região
- Playlists de mídia
- Widgets (relógio, previsão do tempo, notícias)
- Conteúdo dinâmico via API

---

## 6. Agendamento de Layouts

### Por Grupo de Players
- Múltiplos layouts agendados por grupo
- Prioridade entre layouts (qual prevalece)
- Layout padrão (fallback)

### Por Player Individual
- Override de layout do grupo
- Agendamentos específicos por player
- Herança ou personalização

### Tipos de Agendamento
- **Sempre ativo**: Layout fixo
- **Por período**: Data de início e fim
- **Recorrente**: Dias da semana e horários específicos

---

## 7. Widgets

### Tipos Disponíveis
- **Relógio**: Digital ou analógico com configuração de fuso horário
- **Previsão do Tempo**: Integração com APIs meteorológicas
- **Notícias/RSS**: Feed de notícias configurável
- **Texto**: Mensagens personalizadas
- **QR Code**: Geração dinâmica

### Configuração
- Personalização visual (cores, fontes, tamanhos)
- Atualização automática de dados
- Posicionamento em qualquer região do layout

---

## 8. Relatórios e Analytics

### Logs de Reprodução
- Registro de cada mídia reproduzida
- Data, hora e duração da exibição
- Histórico por player
- Exportação de dados

### Métricas do Dashboard
- Total de players (online/offline)
- Total de mídias (vídeos/imagens)
- Uso de armazenamento
- Playlists ativas
- Atividade dos últimos 7 dias

### Heartbeat
- Histórico de conexões por player
- Detecção de quedas de conexão
- Tempo médio online

---

## 9. Multi-Tenancy (Clientes)

### Gestão de Tenants
- Cadastro de empresas/clientes
- Isolamento completo de dados entre clientes
- Configurações personalizadas por tenant
- Domínio/subdomain customizado (opcional)

### Planos e Limites
- Limite de players por tenant
- Limite de armazenamento
- Funcionalidades por plano

---

## 10. Usuários e Permissões

### Níveis de Acesso
- **Super Admin**: Acesso total ao sistema
- **Admin do Tenant**: Gerencia seu próprio tenant
- **Editor**: Cria e edita conteúdo
- **Visualizador**: Apenas visualização

### Gestão de Usuários
- Convite por email
- Definição de papel/função
- Múltiplos usuários por tenant
- Acesso a múltiplos tenants (opcional)

---

## 11. Configurações de Conta

### Perfil do Usuário
- Atualização de dados pessoais
- Troca de senha
- Preferência de idioma (Português/Inglês)
- Tema claro/escuro

### Segurança
- Autenticação de dois fatores (2FA)
- Sessões ativas
- Histórico de login

---

## 12. Sistema de Tags

### Organização
- Criação de tags com nome e cor
- Aplicação em mídias
- Aplicação em playlists
- Filtro por tags em listagens

---

## 13. Funcionalidades do Painel

### Interface
- Design responsivo
- Tema claro e escuro
- Internacionalização (PT-BR e EN)
- Busca global
- Notificações em tempo real

### Navegação
- Dashboard com visão geral
- Menu lateral colapsável
- Breadcrumbs para navegação
- Atalhos de teclado

### Tabelas e Listagens
- Paginação
- Ordenação por colunas
- Filtros avançados
- Seleção em lote
- Ações em massa

---

## 14. API para Players

### Endpoints
- Buscar playlist atual
- Enviar heartbeat (status)
- Registrar logs de reprodução

### Segurança
- Token único por player
- Autenticação Bearer
- Rate limiting
- Validação de tenant

---

## 15. Aplicativo Android TV

### Reprodução
- Reprodução de vídeos em loop
- Exibição de imagens com temporizador
- Transições suaves entre mídias
- Suporte a múltiplas resoluções

### Conectividade
- Download de mídias para cache local
- Funcionamento offline com cache
- Sincronização automática
- Reconexão automática

### Controle Remoto
- Configurações via painel web
- Reinicialização remota
- Atualização de playlist em tempo real

---

## 16. Funcionalidades Administrativas (Super Admin)

### Gestão Global
- Visualização de todos os tenants
- Criação de novos tenants
- Configurações globais do sistema
- Logs de auditoria

### Manutenção
- Limpeza de dados antigos
- Monitoramento de uso
- Gestão de armazenamento

---

## 17. Integrações

### Armazenamento
- Amazon S3
- MinIO (self-hosted)
- Armazenamento local (desenvolvimento)

### Processamento de Mídia
- FFmpeg para vídeos
- Intervention Image para imagens

### Cache e Filas
- Redis para cache
- Laravel Horizon para filas de processamento

---

## Resumo de Diferenciais

1. **Multi-tenancy completo** - Múltiplos clientes isolados
2. **Layouts flexíveis** - Múltiplas regiões com posicionamento livre
3. **Agendamento avançado** - Por período, recorrente, com prioridades
4. **Herança inteligente** - Grupo → Player com override opcional
5. **Widgets integrados** - Relógio, clima, notícias
6. **Offline-first** - Funciona mesmo sem internet
7. **Analytics detalhado** - Logs de reprodução e métricas
8. **Multi-idioma** - Interface em PT e EN
9. **API robusta** - Para integração com players
10. **Escalável** - Arquitetura cloud-native
