const express = require('express');

// 6 endpoints por recurso: GET lista, GET id, POST, PUT, PATCH, DELETE
function createCrudRouter(service) {
  const router = express.Router();
  router.get('/', (req, res) => res.json(service.list(req.query)));
  router.get('/:id', (req, res) => res.json(service.get(req.params.id)));
  router.post('/', (req, res) => res.status(201).json(service.create(req.body)));
  router.put('/:id', (req, res) => res.json(service.replace(req.params.id, req.body)));
  router.patch('/:id', (req, res) => res.json(service.update(req.params.id, req.body)));
  router.delete('/:id', (req, res) => res.json({ eliminado: service.remove(req.params.id) }));
  return router;
}

module.exports = createCrudRouter;
