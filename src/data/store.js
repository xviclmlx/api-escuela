const seed = require('./seed');

// Almacén en memoria compartido por todos los servicios.
let db = seed();

module.exports = {
  collection: (name) => db[name],
  reset: () => { db = seed(); }
};
