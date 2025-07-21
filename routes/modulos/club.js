const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const archivoClub = path.join(__dirname, '../../data/club.json');

// Leer críticas
router.get('/', (req, res) => {
  const data = fs.existsSync(archivoClub) ? JSON.parse(fs.readFileSync(archivoClub)) : [];
  res.json(data);
});

// Guardar nueva crítica
router.post('/', (req, res) => {
  const entrada = req.body;
  const club = fs.existsSync(archivoClub)
    ? JSON.parse(fs.readFileSync(archivoClub, 'utf8'))
    : [];

  const nueva = {
    id: Date.now(),
    usuario: entrada.usuario || 'Anónimo',
    texto: entrada.texto || '',
    tipo: entrada.tipo || 'general',
    fecha: entrada.fecha || new Date().toLocaleDateString(),
    hora: entrada.hora || new Date().toLocaleTimeString(),
    favorito: false,
    likes: 0,
    respuestas: [],
    nuevaRespuesta: '',
    mostrarRespuestas: false
  };

  club.unshift(nueva);
  fs.writeFileSync(archivoClub, JSON.stringify(club, null, 2));
  res.status(201).json(nueva); // ✅ importante: status 201 y objeto completo
});

// Like (solo dejar esta versión)
router.post('/:id/like', (req, res) => {
  const data = JSON.parse(fs.readFileSync(archivoClub));
  const pub = data.find(p => p.id == req.params.id);
  if (pub) {
    pub.likes = (pub.likes || 0) + 1;
    fs.writeFileSync(archivoClub, JSON.stringify(data, null, 2));
    res.json(pub);
  } else {
    res.status(404).json({ error: 'Publicación no encontrada' });
  }
});

// Responder
router.post('/:id/responder', (req, res) => {
  const data = JSON.parse(fs.readFileSync(archivoClub));
  const pub = data.find(p => p.id == req.params.id);
  if (pub) {
    pub.respuestas = pub.respuestas || [];
    pub.respuestas.push(req.body);
    fs.writeFileSync(archivoClub, JSON.stringify(data, null, 2));
    res.json(pub);
  } else {
    res.status(404).json({ error: 'Publicación no encontrada' });
  }
});


module.exports = router;
