const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const archivoMuro = path.join(__dirname, '../../data/muro.json');

// Asegurar que el archivo exista
if (!fs.existsSync(archivoMuro)) {
  fs.writeFileSync(archivoMuro, '[]');
}

// Leer publicaciones
const cargarPublicaciones = () => {
  try {
    const data = fs.readFileSync(archivoMuro, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Guardar publicaciones
const guardarPublicaciones = (publicaciones) => {
  fs.writeFileSync(archivoMuro, JSON.stringify(publicaciones, null, 2));
};

// GET - Obtener publicaciones
router.get('/', (req, res) => {
  const publicaciones = cargarPublicaciones();
  res.json(publicaciones);
});

// POST - Nueva publicación
router.post('/', (req, res) => {
  const publicaciones = cargarPublicaciones();
  const nueva = {
    id: Date.now(),
    texto: req.body.texto,
    respuestas: [],
    reacciones: { corazon: 0, pensamiento: 0, compartir: 0 }
  };
  publicaciones.unshift(nueva);
  guardarPublicaciones(publicaciones);
  res.json(nueva);
});

// PATCH - Agregar respuesta
router.patch('/:id/responder', (req, res) => {
  const publicaciones = cargarPublicaciones();
  const { id } = req.params;
  const { texto } = req.body;

  const pub = publicaciones.find(p => p.id == id);
  if (pub) {
    pub.respuestas.push(texto);
    guardarPublicaciones(publicaciones);
    res.json(pub);
  } else {
    res.status(404).json({ error: 'Publicación no encontrada' });
  }
});

// PATCH - Reacción (❤️ 💭 🔁)
router.patch('/:id/reaccionar', (req, res) => {
  const publicaciones = cargarPublicaciones();
  const { id } = req.params;
  const { tipo } = req.body;

  const pub = publicaciones.find(p => p.id == id);
  if (pub && pub.reacciones[tipo] !== undefined) {
    pub.reacciones[tipo]++;
    guardarPublicaciones(publicaciones);
    res.json(pub);
  } else {
    res.status(404).json({ error: 'Error en reacción' });
  }
});
router.post('/:id/reaccion', (req, res) => {
  const id = req.params.id;
  const { tipo } = req.body;

  const publicaciones = cargarPublicaciones();
  const publicacion = publicaciones.find(p => p.id == id);
  if (!publicacion) {
    return res.status(404).json({ error: 'Publicación no encontrada' });
  }

  if (!publicacion.reacciones) {
    publicacion.reacciones = { corazon: 0, comentario: 0, compartir: 0 };
  }

  if (tipo === 'corazon') publicacion.reacciones.corazon += 1;
  if (tipo === 'comentario') publicacion.reacciones.comentario += 1;
  if (tipo === 'compartir') publicacion.reacciones.compartir += 1;

  guardarPublicaciones(publicaciones);
  res.json({ mensaje: 'Reacción guardada' });
});



module.exports = router;
