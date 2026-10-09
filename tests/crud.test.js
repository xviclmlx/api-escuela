const request = require('supertest');
const app = require('../src/app');
const store = require('../src/data/store');

const url = '/api/alumnos';
const body = { nombre: 'Pedro Sánchez', matricula: 'A900', email: 'pedro@escuela.mx', semestre: 1 };

beforeEach(() => store.reset());

describe('CRUD /api/alumnos', () => {
  test('GET lista', async () => {
    const res = await request(app).get(url);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBe(3);
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
    expect(res.body.id).toBe(4);
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
    const res = await request(app).patch(`${url}/1`).send({ nombre: 'Editado' });
    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Editado');
    expect(res.body.matricula).toBe('A001');
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
  test('Filtros y paginación en la lista', async () => {
    const res = await request(app).get(`${url}?semestre=5&limit=1&page=2`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(3);
  });

  test('Campo numérico con texto → 400', async () => {
    const res = await request(app).post(url).send({ ...body, semestre: 'primero' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/numérico/);
  });

  test('Campo único duplicado → 409', async () => {
    const res = await request(app).post(url).send({ ...body, matricula: 'A001' });
    expect(res.status).toBe(409);
  });

  test('Cuerpo que no es objeto → 400', async () => {
    const res = await request(app).post(url).send([1, 2]);
    expect(res.status).toBe(400);
  });

  test('PUT/PATCH sobre id inexistente → 404', async () => {
    expect((await request(app).put(`${url}/999`).send(body)).status).toBe(404);
    expect((await request(app).patch(`${url}/999`).send({ nombre: 'X' })).status).toBe(404);
  });
});
