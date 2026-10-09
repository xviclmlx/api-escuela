// Datos iniciales (en memoria). Se recargan al reiniciar el contenedor.
module.exports = () => ({
  alumnos: [
    { id: 1, nombre: 'Ana López', matricula: 'A001', email: 'ana@escuela.mx', semestre: 5 },
    { id: 2, nombre: 'Luis Pérez', matricula: 'A002', email: 'luis@escuela.mx', semestre: 3 },
    { id: 3, nombre: 'María Ruiz', matricula: 'A003', email: 'maria@escuela.mx', semestre: 5 }
  ]
});
