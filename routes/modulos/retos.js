const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const archivoRetos = path.join(__dirname, '../retos.json');

// Asegurar archivo retos.json
if (!fs.existsSync(archivoRetos)) {
  fs.writeFileSync(archivoRetos, '[]');
}

// Cargar retos
const cargarRetos = () => {
  try {
    const data = fs.readFileSync(archivoRetos, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Guardar retos
const guardarRetos = (retos) => {
  fs.writeFileSync(archivoRetos, JSON.stringify(retos, null, 2));
};

// GET - obtener todos los retos completados
router.get('/', (req, res) => {
  const retos = cargarRetos();
  res.json(retos);
});

// POST - guardar nuevo reto
router.post('/', (req, res) => {
  const retos = cargarRetos();
  const nuevoReto = req.body;
  retos.push(nuevoReto);
  guardarRetos(retos);
  res.json({ mensaje: '✅ Reto guardado correctamente', reto: nuevoReto });
});

// PUT /api/retos/:id
module.exports = router;
