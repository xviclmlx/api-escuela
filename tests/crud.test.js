const request = require('supertest');
const app = require('../src/app');
const store = require('../src/data/store');

// Payload válido de ejemplo para cada uno de los 10 recursos
const ejemplos = {
  carreras:       { nombre: 'Mecatrónica', clave: 'MEC', duracionSemestres: 9 },
  alumnos:        { nombre: 'Pedro Sánchez', matricula: 'A900', email: 'pedro@escuela.mx', semestre: 1, carreraId: 1 },
  profesores:     { nombre: 'Ing. Juan Díaz', email: 'juan@escuela.mx', especialidad: 'Redes' },
  materias:       { nombre: 'Redes', clave: 'RED101', creditos: 4, carreraId: 1 },
  aulas:          { nombre: 'Lab 9', edificio: 'K', capacidad: 25 },
  grupos:         { clave: 'RED101-A', materiaId: 1, profesorId: 1, periodo: '2026-2' },
  horarios:       { grupoId: 1, aulaId: 1, dia: 'Viernes', horaInicio: '08:00', horaFin: '10:00' },
  inscripciones:  { alumnoId: 3, grupoId: 2, fecha: '2026-08-12' },
  calificaciones: { alumnoId: 2, materiaId: 2, parcial: 1, valor: 88 },
  asistencias:    { alumnoId: 1, grupoId: 2, fecha: '2026-10-06', presente: true }
};

beforeEach(() => store.reset());

describe.each(Object.keys(ejemplos))('CRUD /api/%s', (recurso) => {
  const url = `/api/${recurso}`;
  const body = ejemplos[recurso];

  test('GET lista', async () => {
    const res = await request(app).get(url);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });

  test('GET por id existente', async () => {
    const res = await request(app).get(`${url}/1`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  test('GET por id inexistente → 404', async () => {
    const res = await request(app).get(`${url}/9999`);
    expect(res.status).toBe(404);
  });

  test('POST crea registro → 201', async () => {
    const res = await request(app).post(url).send(body);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(body);
    expect(res.body.id).toBeDefined();
  });

  test('POST sin campos requeridos → 400', async () => {
    const res = await request(app).post(url).send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/requeridos/);
  });

  test('PUT reemplaza registro', async () => {
    const res = await request(app).put(`${url}/1`).send(body);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ...body, id: 1 });
  });

  test('PATCH actualiza parcialmente', async () => {
    const campo = Object.keys(body).find((k) => typeof body[k] === 'string');
    const res = await request(app).patch(`${url}/1`).send({ [campo]: 'Editado' });
    expect(res.status).toBe(200);
    expect(res.body[campo]).toBe('Editado');
  });

  test('DELETE elimina y luego GET → 404', async () => {
    const del = await request(app).delete(`${url}/1`);
    expect(del.status).toBe(200);
    const res = await request(app).get(`${url}/1`);
    expect(res.status).toBe(404);
  });

  test('DELETE inexistente → 404', async () => {
    const res = await request(app).delete(`${url}/9999`);
    expect(res.status).toBe(404);
  });
});

describe('Validaciones', () => {
  beforeEach(() => store.reset());

  test('Filtros y paginación en la lista', async () => {
    const res = await request(app).get('/api/alumnos?carreraId=1&limit=1&page=2');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(2);
  });

  test('Campo numérico con texto → 400', async () => {
    const res = await request(app).post('/api/aulas').send({ nombre: 'X', capacidad: 'muchos' });
    expect(res.status).toBe(400);
  });

  test('Calificación fuera de rango → 400', async () => {
    const res = await request(app).post('/api/calificaciones').send({ alumnoId: 1, materiaId: 1, valor: 150 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/entre 0 y 100/);
  });

  test('Llave foránea inexistente → 400', async () => {
    const res = await request(app).post('/api/grupos').send({ clave: 'X', materiaId: 99, profesorId: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no existe/);
  });

  test('Campo único duplicado → 409', async () => {
    const res = await request(app).post('/api/alumnos').send({ nombre: 'Clon', matricula: 'A001', email: 'x@x.mx' });
    expect(res.status).toBe(409);
  });

  test('Cuerpo que no es objeto → 400', async () => {
    const res = await request(app).post('/api/aulas').send([1, 2]);
    expect(res.status).toBe(400);
  });

  test('PUT/PATCH sobre id inexistente → 404', async () => {
    expect((await request(app).put('/api/aulas/999').send({ nombre: 'X' })).status).toBe(404);
    expect((await request(app).patch('/api/aulas/999').send({ nombre: 'X' })).status).toBe(404);
  });
});
