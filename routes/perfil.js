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
  const { entrada, email } = req.body; // { fecha, texto }, email

  if (!entrada || !entrada.texto || !entrada.fecha || !email) {
    return res.status(400).json({ error: 'Faltan datos del usuario o de la entrada' });
  }

  let datos = {};
  if (fs.existsSync(archivoPerfil)) {
    datos = JSON.parse(fs.readFileSync(archivoPerfil, 'utf-8'));
  }

  // Si no existe el usuario aún
  if (!datos[email]) {
    datos[email] = {
      bios: []
    };
  }

  const historial = datos[email].bios;

  // Verificar si ya existe entrada para la misma fecha
  const existente = historial.find(b => b.fecha === entrada.fecha);
  if (existente) {
    // Reemplazar texto
    existente.texto = entrada.texto;
  } else {
    historial.push(entrada);
  }

  // Guardar de nuevo
  fs.writeFileSync(archivoPerfil, JSON.stringify(datos, null, 2));

  res.json({ mensaje: 'Entrada guardada correctamente', bios: historial });
});

module.exports = router;
