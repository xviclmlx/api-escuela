const store = require('../data/store');

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Crea un servicio CRUD con validaciones para una colección.
function createService(name, rules = {}) {
  const col = () => store.collection(name);
  const nextId = () => col().reduce((max, item) => Math.max(max, item.id), 0) + 1;

  function validate(data, { partial = false, currentId = null } = {}) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new HttpError(400, 'El cuerpo debe ser un objeto JSON');
    }
    if (!partial) {
      const missing = (rules.required || []).filter((f) => data[f] === undefined || data[f] === '');
      if (missing.length) throw new HttpError(400, `Campos requeridos: ${missing.join(', ')}`);
    }
    for (const f of rules.numbers || []) {
      if (data[f] !== undefined && typeof data[f] !== 'number') {
        throw new HttpError(400, `El campo ${f} debe ser numérico`);
      }
    }
    for (const f of rules.unique || []) {
      if (data[f] !== undefined && col().some((x) => x[f] === data[f] && x.id !== currentId)) {
        throw new HttpError(409, `Ya existe un registro con ${f}=${data[f]}`);
      }
    }
  }

  return {
    list(query = {}) {
      const { page, limit, ...filters } = query;
      let items = col().filter((item) =>
        Object.entries(filters).every(([k, v]) => String(item[k]) === String(v)));
      const total = items.length;
      if (limit) {
        const l = Math.max(1, parseInt(limit, 10) || 10);
        const p = Math.max(1, parseInt(page, 10) || 1);
        items = items.slice((p - 1) * l, p * l);
      }
      return { total, data: items };
    },
    get(id) {
      const item = col().find((x) => x.id === Number(id));
      if (!item) throw new HttpError(404, `${name} con id ${id} no encontrado`);
      return item;
    },
    create(data) {
      validate(data);
      const item = { ...data, id: nextId() };
      col().push(item);
      return item;
    },
    replace(id, data) {
      const current = this.get(id);
      validate(data, { currentId: current.id });
      const item = { ...data, id: current.id };
      col()[col().indexOf(current)] = item;
      return item;
    },
    update(id, data) {
      const current = this.get(id);
      validate(data, { partial: true, currentId: current.id });
      Object.assign(current, data, { id: current.id });
      return current;
    },
    remove(id) {
      const current = this.get(id);
      col().splice(col().indexOf(current), 1);
      return current;
    }
  };
}

module.exports = { createService, HttpError };
