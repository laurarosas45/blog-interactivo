const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const archivoPerfil = path.join(process.cwd(), 'data/perfil.json');

// Leer perfil
router.get('/', (req, res) => {
  if (!fs.existsSync(archivoPerfil)) {
    return res.json({});
  }

  const data = JSON.parse(fs.readFileSync(archivoPerfil, 'utf-8'));
  res.json(data);
});

// Guardar perfil (bio + estado emocional)
router.post('/', (req, res) => {
  const { nombre, email, bio, estadoEmocional } = req.body;
  

  if (!nombre || !email) {
    return res.status(400).json({ error: 'Faltan datos del usuario' });
  }

  const nuevoPerfil = { nombre, email, bio, estadoEmocional };
  try {
    fs.writeFileSync(archivoPerfil, JSON.stringify(nuevoPerfil, null, 2));
    res.json({ mensaje: 'Perfil guardado', perfil: nuevoPerfil });
  } catch (error) {
    console.error('Error al guardar perfil:', error);
    res.status(500).json({ error: 'Error al guardar datos' });
  }
  });

module.exports = router;
