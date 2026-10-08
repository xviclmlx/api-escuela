// Definición de los 10 recursos de la API.
// required: campos obligatorios en POST/PUT
// numbers: campos que deben ser numéricos
// refs: llaves foráneas que deben existir en otra colección
// unique: campos que no se pueden repetir
module.exports = {
  carreras:       { required: ['nombre', 'clave'], numbers: ['duracionSemestres'], unique: ['clave'] },
  alumnos:        { required: ['nombre', 'matricula', 'email'], numbers: ['semestre'], unique: ['matricula', 'email'], refs: { carreraId: 'carreras' } },
  profesores:     { required: ['nombre', 'email'], unique: ['email'] },
  materias:       { required: ['nombre', 'clave'], numbers: ['creditos'], unique: ['clave'], refs: { carreraId: 'carreras' } },
  aulas:          { required: ['nombre'], numbers: ['capacidad'] },
  grupos:         { required: ['clave', 'materiaId', 'profesorId'], refs: { materiaId: 'materias', profesorId: 'profesores' } },
  horarios:       { required: ['grupoId', 'aulaId', 'dia'], refs: { grupoId: 'grupos', aulaId: 'aulas' } },
  inscripciones:  { required: ['alumnoId', 'grupoId'], refs: { alumnoId: 'alumnos', grupoId: 'grupos' } },
  calificaciones: { required: ['alumnoId', 'materiaId', 'valor'], numbers: ['valor', 'parcial'], range: { valor: [0, 100] }, refs: { alumnoId: 'alumnos', materiaId: 'materias' } },
  asistencias:    { required: ['alumnoId', 'grupoId', 'fecha'], refs: { alumnoId: 'alumnos', grupoId: 'grupos' } }
};
