// publicaciones.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// ✅ RUTA COMPLETA AL ARCHIVO DE PUBLICACIONES
const filePath = path.join(__dirname, '..', 'data', 'publicaciones.json'); // 👈 ajusta si tu archivo está en otra carpeta

// ✅ GET: obtener publicaciones
router.get('/', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer el archivo' });

    const publicaciones = JSON.parse(data || '[]');
    res.json(publicaciones);
  });
});

// ✅ POST: guardar nueva publicación
router.post('/', (req, res) => {
  const nueva = req.body;

  fs.readFile(filePath, 'utf8', (err, data) => {
    let publicaciones = [];
    if (!err && data) publicaciones = JSON.parse(data);

    nueva.id = Date.now();
    nueva.comentarios = [];

    publicaciones.unshift(nueva);

    fs.writeFile(filePath, JSON.stringify(publicaciones, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error al guardar publicación' });

      res.status(201).json(nueva);
    });
  });
});



module.exports = router;