# 🚀 GUÍA DE DESPLIEGUE - TRUCK BACKEND

## 📦 OPCIÓN 1: RENDER (Recomendada - Más Fácil)

### Paso 1: Preparar el Repositorio
```bash
# Asegúrate de que todos los cambios estén en GitHub
git add .
git commit -m "Preparado para producción"
git push origin main
```

### Paso 2: Crear Cuenta en Render
1. Ve a [https://render.com](https://render.com)
2. Regístrate con tu cuenta de GitHub
3. Autoriza a Render para acceder a tus repositorios

### Paso 3: Desplegar Base de Datos PostgreSQL
1. En el Dashboard, haz clic en **"New +"** → **"PostgreSQL"**
2. Configuración:
   - **Name**: `truck-db`
   - **Database**: `truck_database`
   - **User**: `truck_user`
   - **Region**: Oregon (o el más cercano)
   - **Plan**: **Free**
3. Clic en **"Create Database"**
4. **IMPORTANTE**: Guarda la **Internal Database URL** (la necesitarás después)

### Paso 4: Desplegar Backend
1. En el Dashboard, haz clic en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub: `truck_back`
3. Configuración:
   - **Name**: `truck-backend`
   - **Region**: Oregon (mismo que la BD)
   - **Branch**: `main`
   - **Root Directory**: Dejar vacío
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: **Free**

### Paso 5: Configurar Variables de Entorno
En la sección **Environment**, agregar:

```env
NODE_ENV=production
APP_ENV=production
PORT=3000
JWT_SECRET=<GENERAR_UNO_SEGURO>
DURACION_ACCESS_TOKEN=24h
DATABASE_URL=<INTERNAL_DATABASE_URL_DEL_PASO_3>
FRONTEND_URL=<URL_DE_TU_FRONTEND>
```

**Para generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Paso 6: Desplegar
1. Clic en **"Create Web Service"**
2. Render automáticamente:
   - Descarga tu código
   - Instala dependencias
   - Ejecuta el build
   - Inicia el servidor
3. **¡Listo!** Tu API estará en: `https://truck-backend.onrender.com`

### 🔄 Redespliegues Automáticos
Cada vez que hagas `git push` a la rama `main`, Render redesplegaría automáticamente.

---

## 📦 OPCIÓN 2: RAILWAY (Alternativa Simple)

### Ventajas
- ✓ Muy fácil de usar
- ✓ PostgreSQL incluido
- ✓ $5 USD de crédito mensual gratis

### Desventajas
- ⚠️ El crédito puede agotarse si hay mucho tráfico
- ⚠️ Requiere tarjeta de crédito (no cobran si no excedes el crédito)

### Pasos Railway
1. Ve a [https://railway.app](https://railway.app)
2. Regístrate con GitHub
3. **"New Project"** → **"Deploy from GitHub repo"**
4. Selecciona `truck_back`
5. Railway detectará Node.js automáticamente
6. Agregar PostgreSQL: **"New"** → **"Database"** → **"PostgreSQL"**
7. Configurar variables de entorno (igual que Render)
8. ¡Listo!

---

## 📦 OPCIÓN 3: FLY.IO (Para Usuarios Avanzados)

### Ventajas
- ✓ Muy rápido
- ✓ Buena infraestructura
- ✓ PostgreSQL gratis

### Desventajas
- ⚠️ Más complejo de configurar
- ⚠️ Requiere CLI

### Pasos Fly.io
```bash
# 1. Instalar Fly CLI
npm install -g flyctl

# 2. Login
flyctl auth login

# 3. Inicializar proyecto
flyctl launch

# 4. Crear PostgreSQL
flyctl postgres create

# 5. Conectar BD
flyctl postgres attach <postgres-app-name>

# 6. Desplegar
flyctl deploy
```

---

## 🎯 COMPARATIVA RÁPIDA

| Característica | Render | Railway | Fly.io |
|---------------|--------|---------|--------|
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Costo** | 100% Gratis | $5 crédito/mes | Gratis* |
| **PostgreSQL** | ✅ Incluido | ✅ Incluido | ✅ Incluido |
| **SSL** | ✅ Automático | ✅ Automático | ✅ Automático |
| **CI/CD** | ✅ Auto | ✅ Auto | ⚠️ Manual |
| **Sleep Mode** | Sí (15 min) | No | No |
| **Tarjeta** | ❌ No requiere | ⚠️ Requiere | ⚠️ Requiere |

---

## 🔧 DESPUÉS DEL DESPLIEGUE

### Verificar que funcione:
```bash
# Probar health check
curl https://tu-app.onrender.com

# Probar login
curl -X POST https://tu-app.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"tu@correo.com","password":"tupassword"}'
```

### Configurar Frontend
Actualiza la URL del backend en tu aplicación frontend:
```javascript
const API_URL = 'https://truck-backend.onrender.com/api/v1';
```

---

## 📊 MONITOREO (Render)

1. **Logs**: Ve a tu servicio → pestaña "Logs"
2. **Métricas**: Ve a la pestaña "Metrics"
3. **Base de Datos**: Ve a tu PostgreSQL → "Connections"

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Application failed to start"
- Verifica que `NODE_ENV=production` esté configurado
- Revisa los logs en Render
- Verifica que `DATABASE_URL` sea correcto

### Error de conexión a BD
- Usa la **Internal Database URL**, no la External
- Verifica que la BD esté en la misma región

### El servidor tarda en responder
- Normal en Render Free (sleep mode)
- Primera petición tarda ~1 minuto
- Considera usar un servicio de "keep alive" si es crítico

---

## 💡 CONSEJOS FINALES

1. **No subas el .env** al repositorio (ya está en .gitignore)
2. **Configura CORS** con la URL correcta del frontend
3. **Monitorea los logs** las primeras 24h
4. **Haz backup** de la BD manualmente desde Render
5. **Documenta las URLs** de producción

---

## 📞 RECURSOS

- [Documentación Render](https://render.com/docs)
- [Documentación Railway](https://docs.railway.app)
- [Documentación Fly.io](https://fly.io/docs)
- [NestJS Deployment](https://docs.nestjs.com/faq/deployment)
