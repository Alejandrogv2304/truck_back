# 🚨 CHECKLIST DE SEGURIDAD PARA PRODUCCIÓN

## ✅ Antes de Desplegar

### Configuración Crítica
- [ ] Cambiar `NODE_ENV=production` en variables de entorno
- [ ] Generar JWT_SECRET único y fuerte (mínimo 32 caracteres)
- [ ] Verificar que `synchronize: false` en producción
- [ ] Configurar SSL en base de datos
- [ ] Establecer FRONTEND_URL correcto

### Base de Datos
- [ ] Crear backup antes del despliegue
- [ ] Configurar backups automáticos diarios
- [ ] Revisar índices en tablas principales
- [ ] Validar conexiones SSL

### Seguridad Adicional (Opcional pero Recomendado)
- [ ] Instalar y configurar `helmet` para headers de seguridad
- [ ] Implementar rate limiting con `@nestjs/throttler`
- [ ] Configurar logs de producción (Winston/Pino)
- [ ] Implementar monitoreo de errores (Sentry)

### Variables de Entorno
```bash
# Generar JWT_SECRET seguro:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Testing
- [ ] Probar todos los endpoints en staging
- [ ] Verificar autenticación y autorización
- [ ] Validar filtros de multi-tenancy
- [ ] Probar casos de error

## 📦 Instalación de Paquetes de Seguridad (Recomendado)

```bash
# Rate limiting
npm install @nestjs/throttler

# Headers de seguridad
npm install helmet
npm install --save-dev @types/helmet
```

### Implementación en main.ts:
```typescript
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Helmet para headers de seguridad
  app.use(helmet());
  
  // ... resto de configuración
}
```

### Implementación de Rate Limiting en app.module.ts:
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minuto
      limit: 10,  // 10 requests
    }]),
    // ... otros módulos
  ],
})
```

## 🔍 Monitoreo Post-Despliegue
- [ ] Verificar logs de errores
- [ ] Monitorear uso de base de datos
- [ ] Revisar tiempos de respuesta
- [ ] Validar autenticación funcione correctamente

## 📞 Contacto de Emergencia
- Tener backup de base de datos accesible
- Documentar proceso de rollback
- Lista de credenciales de acceso seguras
