#!/bin/bash

# Script de instalação inicial do TranscritorAI Pro
# Author: TranscritorAI Team
# Version: 1.0.0

set -e

echo "=========================================="
echo "TranscritorAI Pro - Setup"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Python 3.11+ está instalado
echo "Verificando Python..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 não encontrado!${NC}"
    echo "Instale Python 3.11+ e tente novamente."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo -e "${GREEN}✓ Python $PYTHON_VERSION encontrado${NC}"

# Verificar FFmpeg
echo "Verificando FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${YELLOW}⚠ FFmpeg não encontrado!${NC}"
    echo "FFmpeg é necessário para processamento de vídeo."
    echo "Instale com:"
    echo "  Ubuntu/Debian: sudo apt-get install ffmpeg"
    echo "  MacOS: brew install ffmpeg"
    echo "  Windows: https://ffmpeg.org/download.html"
else
    echo -e "${GREEN}✓ FFmpeg encontrado${NC}"
fi

# Criar ambiente virtual
echo ""
echo "Criando ambiente virtual..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Ambiente virtual criado${NC}"
else
    echo -e "${YELLOW}⚠ Ambiente virtual já existe${NC}"
fi

# Ativar ambiente virtual
echo "Ativando ambiente virtual..."
source venv/bin/activate || source venv/Scripts/activate

# Upgrade pip
echo "Atualizando pip..."
pip install --upgrade pip

# Instalar dependências
echo ""
echo "Instalando dependências..."
pip install -r requirements.txt

echo -e "${GREEN}✓ Dependências instaladas${NC}"

# Baixar modelos do spaCy
echo ""
echo "Baixando modelos do spaCy..."
python -m spacy download pt_core_news_sm

echo -e "${GREEN}✓ Modelos do spaCy instalados${NC}"

# Criar arquivo .env se não existir
echo ""
if [ ! -f ".env" ]; then
    echo "Criando arquivo .env..."
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado${NC}"
    echo -e "${YELLOW}⚠ IMPORTANTE: Edite o arquivo .env com suas configurações!${NC}"
else
    echo -e "${YELLOW}⚠ Arquivo .env já existe${NC}"
fi

# Criar diretórios necessários
echo ""
echo "Criando diretórios..."
mkdir -p /tmp/uploads
mkdir -p /tmp/transcriptions
mkdir -p logs

echo -e "${GREEN}✓ Diretórios criados${NC}"

# Informações finais
echo ""
echo "=========================================="
echo -e "${GREEN}✓ Setup concluído com sucesso!${NC}"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo ""
echo "1. Configure o arquivo .env com suas credenciais:"
echo "   - DATABASE_URL"
echo "   - REDIS_URL"
echo "   - OPENAI_API_KEY (opcional)"
echo "   - PYANNOTE_AUTH_TOKEN (opcional, para diarização)"
echo ""
echo "2. Inicie os serviços com Docker:"
echo "   cd .."
echo "   docker-compose up -d postgres redis minio"
echo ""
echo "3. Execute o download de modelos:"
echo "   python ../scripts/download_models.py"
echo ""
echo "4. Inicie a aplicação:"
echo "   Terminal 1: uvicorn app.main:app --reload"
echo "   Terminal 2: celery -A app.workers.celery_app worker --loglevel=info"
echo ""
echo "5. Acesse a documentação em:"
echo "   http://localhost:8000/docs"
echo ""
echo "=========================================="
