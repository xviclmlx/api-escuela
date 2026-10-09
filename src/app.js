const express = require('express');
const { createService } = require('./services/crudService');
const createCrudRouter = require('./routes/crudRouter');
const pkg = require('../package.json');

// 👇 Cambia este mensaje en la demo en vivo para evidenciar el despliegue automático
const MENSAJE = 'API Escuela desplegada con CI/CD 🚀 v2';

const app = express();
app.use(express.json());

// --- Endpoints generales (3) ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});
app.get('/api/version', (req, res) => {
  res.json({ version: pkg.version, mensaje: MENSAJE, commit: process.env.GIT_SHA || 'local' });
});

// --- CRUD de alumnos (6 endpoints) ---
// required: campos obligatorios en POST/PUT; numbers: deben ser numéricos; unique: no se repiten
const alumnos = createService('alumnos', {
  required: ['nombre', 'matricula', 'email'],
  numbers: ['semestre'],
  unique: ['matricula', 'email']
});
app.use('/api/alumnos', createCrudRouter(alumnos));

// Índice: lista todos los endpoints registrados
function listEndpoints() {
  const out = [];
  const walk = (stack, prefix) => stack.forEach((layer) => {
    if (layer.route) {
      Object.keys(layer.route.methods).forEach((m) => out.push(`${m.toUpperCase()} ${prefix}${layer.route.path}`.replace(/\/$/, '')));
    } else if (layer.name === 'router') {
      const sub = layer.regexp.source
        .replace('^', '')
        .replace('\\/?(?=\\/|$)', '')
        .replace(/\\\//g, '/');
      walk(layer.handle.stack, prefix + sub);
    }
  });
  walk(app._router.stack, '');
  return out;
}
app.get('/api', (req, res) => {
  const endpoints = listEndpoints();
  res.json({ nombre: 'API Escuela', total: endpoints.length, endpoints });
});

// --- Manejo de errores ---
app.use((req, res) => res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Error interno del servidor' : err.message });
});

module.exports = app;
