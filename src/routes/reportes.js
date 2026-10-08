const express = require('express');
const store = require('../data/store');

// Endpoints de relaciones y reportes (14 endpoints adicionales)
module.exports = (services) => {
  const r = express.Router();
  const c = store.collection;
  const byField = (col, field, id) => c(col).filter((x) => x[field] === Number(id));

  r.get('/alumnos/:id/calificaciones', (req, res) => {
    services.alumnos.get(req.params.id);
    res.json(byField('calificaciones', 'alumnoId', req.params.id));
  });
  r.get('/alumnos/:id/promedio', (req, res) => {
    const alumno = services.alumnos.get(req.params.id);
    const cal = byField('calificaciones', 'alumnoId', req.params.id);
    const promedio = cal.length ? cal.reduce((s, x) => s + x.valor, 0) / cal.length : null;
    res.json({ alumnoId: alumno.id, nombre: alumno.nombre, promedio, totalCalificaciones: cal.length });
  });
  r.get('/alumnos/:id/inscripciones', (req, res) => {
    services.alumnos.get(req.params.id);
    res.json(byField('inscripciones', 'alumnoId', req.params.id));
  });
  r.get('/alumnos/:id/asistencias', (req, res) => {
    services.alumnos.get(req.params.id);
    const lista = byField('asistencias', 'alumnoId', req.params.id);
    const presentes = lista.filter((a) => a.presente).length;
    res.json({ total: lista.length, presentes, porcentaje: lista.length ? (presentes / lista.length) * 100 : null, data: lista });
  });
  r.get('/profesores/:id/grupos', (req, res) => {
    services.profesores.get(req.params.id);
    res.json(byField('grupos', 'profesorId', req.params.id));
  });
  r.get('/materias/:id/grupos', (req, res) => {
    services.materias.get(req.params.id);
    res.json(byField('grupos', 'materiaId', req.params.id));
  });
  r.get('/grupos/:id/alumnos', (req, res) => {
    services.grupos.get(req.params.id);
    const ids = byField('inscripciones', 'grupoId', req.params.id).map((i) => i.alumnoId);
    res.json(c('alumnos').filter((a) => ids.includes(a.id)));
  });
  r.get('/grupos/:id/horarios', (req, res) => {
    services.grupos.get(req.params.id);
    res.json(byField('horarios', 'grupoId', req.params.id));
  });
  r.get('/carreras/:id/alumnos', (req, res) => {
    services.carreras.get(req.params.id);
    res.json(byField('alumnos', 'carreraId', req.params.id));
  });
  r.get('/carreras/:id/materias', (req, res) => {
    services.carreras.get(req.params.id);
    res.json(byField('materias', 'carreraId', req.params.id));
  });
  r.get('/aulas/:id/horarios', (req, res) => {
    services.aulas.get(req.params.id);
    res.json(byField('horarios', 'aulaId', req.params.id));
  });
  r.get('/stats', (req, res) => {
    const cal = c('calificaciones');
    res.json({
      alumnos: c('alumnos').length,
      profesores: c('profesores').length,
      materias: c('materias').length,
      grupos: c('grupos').length,
      promedioGeneral: cal.length ? cal.reduce((s, x) => s + x.valor, 0) / cal.length : null
    });
  });
  r.get('/reportes/reprobados', (req, res) => {
    res.json(c('calificaciones').filter((x) => x.valor < 70));
  });
  r.post('/reset', (req, res) => {
    store.reset();
    res.json({ mensaje: 'Datos reiniciados' });
  });
  return r;
};
