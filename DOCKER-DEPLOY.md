# 🚀 DESPLIEGUE CON DOCKER

## 🧪 Probar Localmente Primero

```bash
# 1. Build de la imagen
docker build -t truck-backend .

# 2. Ejecutar el contenedor
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://postgres.zjkcfigqyhmfvhcozbem:truckalejandro2304@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require" \
  -e JWT_SECRET="9e3755240114fea2e0f593841144cf07" \
  -e DURACION_ACCESS_TOKEN="1d" \
  -e FRONTEND_URL="http://localhost:5173" \
  --name truck-backend \
  truck-backend

# 3. Ver logs
docker logs -f truck-backend

# 4. Probar
curl http://localhost:3000
```

---

## ☁️ OPCIÓN 1: Oracle Cloud (GRATIS PERMANENTE) ⭐

### Ventajas
- ✅ **100% GRATIS PARA SIEMPRE**
- ✅ VM con 1GB RAM (o ARM con 24GB!)
- ✅ 10TB de tráfico/mes
- ✅ IP pública incluida
- ✅ Control total

### Requisitos
- Tarjeta de crédito/débito (para verificación, NO cobran)
- 15-20 minutos de setup inicial

### Paso a Paso

#### 1️⃣ Crear Cuenta en Oracle Cloud
1. Ve a https://www.oracle.com/cloud/free/
2. Clic en "Start for free"
3. Completa el registro (puede tardar 1-2 horas en aprobar)
4. Verificación con tarjeta (NO se cobra nada)

#### 2️⃣ Crear VM Ubuntu
1. En el Dashboard → **Compute** → **Instances**
2. Clic en **"Create Instance"**
3. Configuración:
   - **Name**: `truck-backend-server`
   - **Image**: Ubuntu 22.04 (Always Free Eligible)
   - **Shape**: VM.Standard.E2.1.Micro (1 GB RAM) - GRATIS
   - **Networking**: Crear nueva VCN o usar default
   - **SSH Keys**: Generar par de claves (GUÁRDALAS)
4. Clic en **"Create"**
5. **IMPORTANTE**: Anota la **IP pública** que te asigna

#### 3️⃣ Configurar Firewall de Oracle
1. Ve a **Networking** → **Virtual Cloud Networks**
2. Selecciona tu VCN → **Security Lists** → **Default Security List**
3. Clic en **"Add Ingress Rules"**
4. Agregar:
   ```
   Source CIDR: 0.0.0.0/0
   Destination Port: 3000
   Description: Backend API
   ```
5. Agregar otra para SSH si no está:
   ```
   Source CIDR: 0.0.0.0/0
   Destination Port: 22
   Description: SSH
   ```

#### 4️⃣ Conectar a la VM por SSH

**En Windows (PowerShell):**
```powershell
ssh -i ruta\a\tu\clave-privada.key ubuntu@TU_IP_PUBLICA
```

**En Mac/Linux:**
```bash
chmod 400 tu-clave-privada.key
ssh -i tu-clave-privada.key ubuntu@TU_IP_PUBLICA
```

#### 5️⃣ Instalar Docker en la VM

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker ubuntu

# Reiniciar sesión
exit
# Volver a conectar por SSH

# Verificar instalación
docker --version
```

#### 6️⃣ Subir tu Proyecto

**Opción A: Desde GitHub (Recomendada)**
```bash
# Instalar git
sudo apt install git -y

# Clonar repositorio
git clone https://github.com/Alejandrogv2304/truck_back.git
cd truck_back

# Crear archivo .env
nano .env
```

Pega tu configuración:
```env
NODE_ENV=production
APP_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres.zjkcfigqyhmfvhcozbem:truckalejandro2304@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
JWT_SECRET=9e3755240114fea2e0f593841144cf07
DURACION_ACCESS_TOKEN=1d
FRONTEND_URL=http://localhost:5173
```

Guardar: `Ctrl+X`, luego `Y`, luego `Enter`

#### 7️⃣ Construir y Ejecutar

```bash
# Build de la imagen
docker build -t truck-backend .

# Ejecutar con docker-compose
docker compose up -d

# Ver logs
docker compose logs -f
```

#### 8️⃣ Configurar Firewall de Ubuntu

```bash
# Abrir puerto 3000
sudo ufw allow 3000/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

#### 9️⃣ Probar que Funcione

Desde tu computadora:
```bash
curl http://TU_IP_PUBLICA:3000
```

---

## ☁️ OPCIÓN 2: AWS EC2 (12 MESES GRATIS)

### Paso a Paso Rápido

1. **Crear cuenta AWS** (requiere tarjeta)
2. **EC2 Dashboard** → **Launch Instance**
3. Configuración:
   - **AMI**: Ubuntu 22.04
   - **Instance Type**: t2.micro (Free Tier)
   - **Key Pair**: Crear y descargar
   - **Security Group**: Permitir puertos 22, 3000
4. Seguir pasos 4-9 de Oracle Cloud (son idénticos)

---

## 🔄 Actualizar la Aplicación

```bash
# SSH a la VM
ssh -i tu-clave.key ubuntu@TU_IP

# Ir al proyecto
cd truck_back

# Pull de cambios
git pull origin main

# Rebuild y restart
docker compose down
docker compose up -d --build
```

---

## 🆘 Solución de Problemas

**No puedo conectar por SSH:**
```bash
# Verificar permisos de la clave
chmod 400 tu-clave.key
```

**La aplicación no responde:**
```bash
# Ver logs
docker compose logs

# Ver estado de contenedores
docker ps -a

# Verificar firewall
sudo ufw status
```

**Falta memoria:**
```bash
# Ver uso de recursos
docker stats
free -h
```

---

## 💰 Costos

- **Oracle Cloud**: $0/mes (permanente)
- **AWS EC2**: $0/mes (primeros 12 meses, luego ~$8/mes)
- **Google Cloud**: $0 durante crédito de $300

---

## ✅ Ventajas de Docker + VM

1. ✓ Control total del servidor
2. ✓ Fácil actualización (git pull + rebuild)
3. ✓ Logs completos y accesibles
4. ✓ No hay "sleep mode"
5. ✓ Puedes correr otros servicios en la misma VM

