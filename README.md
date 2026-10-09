# 🎓 API Escuela — Pipeline CI/CD con Docker, GitHub Actions y AWS EC2

API REST de gestión escolar (Node.js + Express) con **9 endpoints**, pruebas automatizadas (Jest + Supertest) y **cobertura >70%**, empaquetada en Docker y desplegada automáticamente en AWS EC2 en cada `git push` a `main`.

## 🏗️ Arquitectura

```
 Desarrollador ──git push──▶ GitHub (main)
                                │
                                ▼
                    GitHub Actions (.github/workflows/main.yml)
   ┌──────────────┐    ┌───────────────────┐    ┌────────────────────┐
   │ 1. test      │──▶ │ 2. build-and-push │──▶ │ 3. deploy-ec2      │
   │ npm ci       │    │ docker login (PAT)│    │ SSH (.pem)         │
   │ jest+coverage│    │ build :latest/:sha│    │ pull → stop → rm   │
   │ umbral 70%   │    │ push Docker Hub   │    │ run -p 80:3000     │
   └──────────────┘    └─────────┬─────────┘    └─────────┬──────────┘
                                 ▼                        ▼
                           Docker Hub  ◀──── docker pull ── AWS EC2 (Ubuntu + Docker)
                                                          │
                                         Usuario ──HTTP:80──▶ http://<IP_EC2>/api/...
```

Si las pruebas fallan o la cobertura baja del 70%, el pipeline se detiene y **no se publica ni se despliega nada**. En un `pull_request` solo se ejecutan las pruebas.

## 📁 Estructura

```
├── .github/workflows/main.yml   # Pipeline CI/CD
├── src/
│   ├── app.js                   # Configuración de Express y rutas
│   ├── server.js                # Punto de entrada (puerto 3000)
│   ├── data/                    # Datos semilla y almacén en memoria
│   ├── routes/crudRouter.js     # Rutas CRUD
│   └── services/crudService.js  # Lógica de negocio y validaciones
├── tests/                       # Pruebas Jest + Supertest
├── Dockerfile
├── .dockerignore
└── README.md
```

## 🔌 Endpoints (9)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api` | Lista todos los endpoints |
| GET | `/api/health` | Estado de la API |
| GET | `/api/version` | Versión, mensaje y hash del commit desplegado |
| GET | `/api/alumnos` | Lista (filtros `?campo=valor`, paginación `?limit=&page=`) |
| GET | `/api/alumnos/:id` | Obtener por id |
| POST | `/api/alumnos` | Crear (requiere `nombre`, `matricula`, `email`) |
| PUT | `/api/alumnos/:id` | Reemplazar |
| PATCH | `/api/alumnos/:id` | Actualizar parcialmente |
| DELETE | `/api/alumnos/:id` | Eliminar |

## 💻 Comandos locales

```bash
npm install            # instalar dependencias
npm run dev            # servidor con recarga en http://localhost:3000
npm test               # pruebas + reporte de cobertura (coverage/lcov-report/index.html)

docker build -t api-escuela .
docker run -d --name api-escuela-container -p 80:3000 api-escuela
curl http://localhost/api/health
```

## ⚙️ Configuración paso a paso

### 1. Docker Hub
1. Crear cuenta y un repositorio público llamado `api-escuela`.
2. *Account Settings → Personal access tokens → Generate new token* con permisos **Read & Write**. Copiar el token (solo se muestra una vez).

### 2. AWS EC2
1. *EC2 → Launch instance*: **Ubuntu Server 24.04 LTS**, tipo `t2.micro`/`t3.micro` (capa gratuita).
2. Crear un **key pair** `.pem` y descargarlo (nunca subirlo al repo).
3. **Security Group** con reglas de entrada:
   - SSH — TCP 22 — origen `0.0.0.0/0` (GitHub Actions usa IPs dinámicas)
   - HTTP — TCP 80 — origen `0.0.0.0/0`
4. Conectarse e instalar Docker:
   ```bash
   chmod 400 llave.pem
   ssh -i llave.pem ubuntu@<IP_EC2>
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker ubuntu   # usar docker sin sudo
   exit                              # volver a entrar para aplicar el grupo
   ```
5. (Recomendado) Asignar una **Elastic IP** para que la IP no cambie al reiniciar la instancia.

### 3. GitHub Secrets
*Repositorio → Settings → Secrets and variables → Actions → New repository secret*

| Secret | Valor |
|---|---|
| `DOCKERHUB_USERNAME` | Usuario de Docker Hub |
| `DOCKERHUB_TOKEN` | Personal Access Token de Docker Hub |
| `EC2_HOST` | IP pública de la EC2 |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_KEY` | Contenido completo del `.pem` (incluye `-----BEGIN ...` y `-----END ...`) |

> 🔒 Ninguna contraseña, IP, token ni llave está en el código: todo se lee desde GitHub Secrets.

## 🎬 Demostración en vivo

1. Editar `MENSAJE` en `src/app.js` (p. ej. `v1` → `v2`).
2. `git add . && git commit -m "feat: actualizar mensaje" && git push`
3. Ver en la pestaña **Actions** los 3 jobs: tests ✅ → Docker Hub ✅ → EC2 ✅.
4. Abrir `http://<IP_EC2>/api/version`: muestra el nuevo mensaje y el hash del commit.
