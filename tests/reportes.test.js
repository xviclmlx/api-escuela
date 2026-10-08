const request = require('supertest');
const app = require('../src/app');
const store = require('../src/data/store');

beforeEach(() => store.reset());

describe('Relaciones y reportes', () => {
  test.each([
    '/api/alumnos/1/calificaciones',
    '/api/alumnos/1/inscripciones',
    '/api/profesores/1/grupos',
    '/api/materias/1/grupos',
    '/api/grupos/1/alumnos',
    '/api/grupos/1/horarios',
    '/api/carreras/1/alumnos',
    '/api/carreras/1/materias',
    '/api/aulas/1/horarios',
    '/api/reportes/reprobados'
  ])('GET %s devuelve un arreglo', async (url) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test.each([
    '/api/alumnos/99/calificaciones', '/api/alumnos/99/promedio', '/api/alumnos/99/inscripciones',
    '/api/alumnos/99/asistencias', '/api/profesores/99/grupos', '/api/materias/99/grupos',
    '/api/grupos/99/alumnos', '/api/grupos/99/horarios', '/api/carreras/99/alumnos',
    '/api/carreras/99/materias', '/api/aulas/99/horarios'
  ])('GET %s con id inexistente → 404', async (url) => {
    expect((await request(app).get(url)).status).toBe(404);
  });

  test('Promedio del alumno 1 es 90', async () => {
    const res = await request(app).get('/api/alumnos/1/promedio');
    expect(res.body.promedio).toBe(90);
  });

  test('Promedio nulo si no tiene calificaciones', async () => {
    const res = await request(app).get('/api/alumnos/3/promedio');
    expect(res.body.promedio).toBeNull();
  });

  test('Asistencias con porcentaje', async () => {
    const res = await request(app).get('/api/alumnos/2/asistencias');
    expect(res.body).toMatchObject({ total: 1, presentes: 0, porcentaje: 0 });
    const vacio = await request(app).get('/api/alumnos/3/asistencias');
    expect(vacio.body.porcentaje).toBeNull();
  });

  test('Grupo 1 tiene 2 alumnos inscritos', async () => {
    const res = await request(app).get('/api/grupos/1/alumnos');
    expect(res.body.map((a) => a.id)).toEqual([1, 2]);
  });

  test('Stats generales', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.body.alumnos).toBe(3);
    expect(res.body.promedioGeneral).toBeCloseTo(86, 0);
  });

  test('Stats sin calificaciones → promedio null', async () => {
    store.collection('calificaciones').length = 0;
    const res = await request(app).get('/api/stats');
    expect(res.body.promedioGeneral).toBeNull();
  });

  test('POST /api/reset restaura los datos', async () => {
    await request(app).delete('/api/alumnos/1');
    await request(app).post('/api/reset');
    expect((await request(app).get('/api/alumnos/1')).status).toBe(200);
  });
});
