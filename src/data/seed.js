// Datos iniciales (en memoria). Se recargan al reiniciar el contenedor.
module.exports = () => ({
  carreras: [
    { id: 1, nombre: 'Ingeniería en Sistemas', clave: 'ISC', duracionSemestres: 9 },
    { id: 2, nombre: 'Ingeniería Industrial', clave: 'IND', duracionSemestres: 9 }
  ],
  alumnos: [
    { id: 1, nombre: 'Ana López', matricula: 'A001', email: 'ana@escuela.mx', semestre: 5, carreraId: 1 },
    { id: 2, nombre: 'Luis Pérez', matricula: 'A002', email: 'luis@escuela.mx', semestre: 3, carreraId: 1 },
    { id: 3, nombre: 'María Ruiz', matricula: 'A003', email: 'maria@escuela.mx', semestre: 7, carreraId: 2 }
  ],
  profesores: [
    { id: 1, nombre: 'Dr. Carlos Hernández', email: 'carlos@escuela.mx', especialidad: 'DevOps' },
    { id: 2, nombre: 'Mtra. Laura Gómez', email: 'laura@escuela.mx', especialidad: 'Bases de Datos' }
  ],
  materias: [
    { id: 1, nombre: 'Gestión DevOps', clave: 'DEV501', creditos: 5, carreraId: 1 },
    { id: 2, nombre: 'Bases de Datos', clave: 'BD301', creditos: 5, carreraId: 1 },
    { id: 3, nombre: 'Logística', clave: 'LOG401', creditos: 4, carreraId: 2 }
  ],
  aulas: [
    { id: 1, nombre: 'Lab 1', edificio: 'K', capacidad: 30 },
    { id: 2, nombre: 'Aula 204', edificio: 'B', capacidad: 40 }
  ],
  grupos: [
    { id: 1, clave: 'DEV501-A', materiaId: 1, profesorId: 1, periodo: '2026-2' },
    { id: 2, clave: 'BD301-A', materiaId: 2, profesorId: 2, periodo: '2026-2' }
  ],
  horarios: [
    { id: 1, grupoId: 1, aulaId: 1, dia: 'Lunes', horaInicio: '18:00', horaFin: '20:00' },
    { id: 2, grupoId: 2, aulaId: 2, dia: 'Martes', horaInicio: '16:00', horaFin: '18:00' }
  ],
  inscripciones: [
    { id: 1, alumnoId: 1, grupoId: 1, fecha: '2026-08-10' },
    { id: 2, alumnoId: 2, grupoId: 1, fecha: '2026-08-10' },
    { id: 3, alumnoId: 1, grupoId: 2, fecha: '2026-08-11' }
  ],
  calificaciones: [
    { id: 1, alumnoId: 1, materiaId: 1, parcial: 1, valor: 95 },
    { id: 2, alumnoId: 1, materiaId: 2, parcial: 1, valor: 85 },
    { id: 3, alumnoId: 2, materiaId: 1, parcial: 1, valor: 78 }
  ],
  asistencias: [
    { id: 1, alumnoId: 1, grupoId: 1, fecha: '2026-10-05', presente: true },
    { id: 2, alumnoId: 2, grupoId: 1, fecha: '2026-10-05', presente: false }
  ]
});
