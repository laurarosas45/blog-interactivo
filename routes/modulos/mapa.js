const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const archivoMapa = path.join(__dirname, '../../../mapa.json');

// Crear archivo si no existe
if (!fs.existsSync(archivoMapa)) {
  fs.writeFileSync(archivoMapa, '[]');
}

// Leer todos los mensajes
router.get('/', (req, res) => {
  try {
    const data = fs.readFileSync(archivoMapa, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Error al leer los mensajes del mapa' });
  }
});

// Guardar nuevo mensaje
router.post('/', (req, res) => {
  try {
    const nuevo = req.body;
    const data = JSON.parse(fs.readFileSync(archivoMapa, 'utf-8'));
    nuevo.id = Date.now();
    data.push(nuevo);
    fs.writeFileSync(archivoMapa, JSON.stringify(data, null, 2));
    res.json(nuevo);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el mensaje del mapa' });
  }
});

module.exports = router;
