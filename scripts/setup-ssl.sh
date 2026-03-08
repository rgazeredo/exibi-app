#!/bin/bash
# Script para configurar SSL com Let's Encrypt no servidor de produção
# Execute como root ou com sudo

set -e

echo "=== Configurando SSL com Let's Encrypt ==="

# 1. Instalar certbot
echo ""
echo "1. Instalando certbot..."
apt update
apt install -y certbot

# 2. Criar diretório para ACME challenge
echo ""
echo "2. Criando diretórios..."
mkdir -p /var/www/certbot

# 3. Parar nginx temporariamente para liberar porta 80
echo ""
echo "3. Parando nginx para gerar certificados..."
docker compose -f docker-compose.prod.yml stop nginx || true

# 4. Gerar certificados (standalone mode)
echo ""
echo "4. Gerando certificados para exibi.com.br (landing page)..."
certbot certonly --standalone -d exibi.com.br -d www.exibi.com.br --non-interactive --agree-tos --email admin@exibi.com.br

echo ""
echo "5. Gerando certificados para app.exibi.com.br (admin panel)..."
certbot certonly --standalone -d app.exibi.com.br --non-interactive --agree-tos --email admin@exibi.com.br

echo ""
echo "6. Gerando certificados para ws.exibi.com.br (websocket)..."
certbot certonly --standalone -d ws.exibi.com.br --non-interactive --agree-tos --email admin@exibi.com.br

# 5. Verificar se certificados foram gerados
echo ""
echo "7. Verificando certificados..."
ls -la /etc/letsencrypt/live/exibi.com.br/
ls -la /etc/letsencrypt/live/app.exibi.com.br/
ls -la /etc/letsencrypt/live/ws.exibi.com.br/

# 6. Iniciar nginx com SSL
echo ""
echo "8. Iniciando nginx com SSL..."
docker compose -f docker-compose.prod.yml up -d nginx

# 7. Configurar renovação automática
echo ""
echo "9. Configurando renovação automática..."
cat > /etc/cron.d/certbot-renew << 'EOF'
0 3 * * * root certbot renew --quiet --deploy-hook "docker compose -f /root/exibi/docker-compose.prod.yml exec nginx nginx -s reload"
EOF

echo ""
echo "=== SSL Configurado com Sucesso! ==="
echo ""
echo "Domínios configurados:"
echo "  https://exibi.com.br        (Landing Page)"
echo "  https://app.exibi.com.br    (Admin Panel)"
echo "  https://ws.exibi.com.br     (WebSocket)"
