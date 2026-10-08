const request = require('supertest');
const app = require('../src/app');

describe('Endpoints generales', () => {
  test('GET /api/health responde ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/version incluye mensaje y versión', async () => {
    const res = await request(app).get('/api/version');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje');
    expect(res.body).toHaveProperty('version');
  });

  test('GET /api lista al menos 60 endpoints', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(60);
    expect(res.body.endpoints).toContain('GET /api/alumnos/:id');
  });

  test('Ruta inexistente devuelve 404', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
  });

  test('JSON mal formado devuelve 400', async () => {
    const res = await request(app)
      .post('/api/alumnos')
      .set('Content-Type', 'application/json')
      .send('{"nombre": ');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('JSON inválido');
  });
});
