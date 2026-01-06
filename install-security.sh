#!/bin/bash

echo "🔒 Instalando paquetes de seguridad recomendados..."

# Rate limiting
npm install @nestjs/throttler

# Headers de seguridad
npm install helmet
npm install --save-dev @types/helmet

echo "✅ Paquetes de seguridad instalados correctamente"
echo ""
echo "📝 Próximos pasos:"
echo "1. Revisar SECURITY-CHECKLIST.md"
echo "2. Configurar .env según .env.example"
echo "3. Implementar helmet y throttler según la documentación"
