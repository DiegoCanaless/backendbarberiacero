# 💈 Barber App - Backend

API REST para gestión de turnos de barbería.  
Permite manejar usuarios, autenticación, servicios, horarios y reservas.

---

## 🚀 Tecnologías utilizadas

- Node.js
- Express
- MySQL
- JWT (autenticación)
- Cookie-parser
- dotenv

---

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/tu-backend.git

# Entrar al proyecto
cd tu-backend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

### ⚙️ Variables de entorno

Crear un archivo .env:

```bash
PORT=3002

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=barberia

JWT_SECRET=tu_secreto

FRONTEND_URL=http://localhost:3000

```

### 🧠 Arquitectura

```bash
src/
│
├── controllers/
├── routes/
├── middlewares/
├── config/
└── database/
```

### 🔐 Autenticación
- Login con JWT
- Uso de cookies seguras
- Middleware de protección de rutas
- Roles: admin barber cliente

### 👤 Endpoints principales
Auth
- POST /auth/login
- POST /auth/register
- POST /auth/logout

Servicios
- GET    /servicios
- GET    /servicios/activos
- POST   /servicios
- PUT    /servicios/:id

Barberos
- GET /barberos
- GET /barberos/:id/servicios
- GET /barberos/:id/horarios

Turnos
- POST /turnos
- GET  /turnos
- GET  /turnos/barbero

Horarios
- POST /horarios
- GET  /horarios/mios

### 📅 Lógica del sistema
- Validación de disponibilidad por horario
- Prevención de turnos duplicados
- Asociación barbero ↔ servicios
- Asociación barbero ↔ horarios
- Estados: activo, oculto
🛠 Base de datos

### Tablas principales:

- usuarios
- servicios
- turnos
- horariotrabajo
- barbero_servicios

### 🚨 Manejo de errores
- Validaciones en cada endpoint
- Respuestas HTTP claras
- Manejo de errores de MySQL

# 🛡 Seguridad
- Validación de datos
- Protección de rutas por rol
- Uso de cookies HTTP-only
- Sanitización básica

# 📌 Mejoras futuras
- Testing
- Login con Google
- Webhooks / bloqueo de concurrencia
- Notificaciones (email / WhatsApp)
- Logs y auditoría
- Rate limiting
- Deploy con Docker

👨‍💻 Autor

Diego Canales