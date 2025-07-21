require('dotenv').config(); // para que .env funcione

const express = require('express');
const cors = require('cors'); // Keep this line
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = 3000;

// ✅ Move app.use(cors()) here, before any routes or other middleware
app.use(cors());
app.use(express.json()); // Keep this here as well, good practice to have it early

app.get('/', (req, res) => {
  res.send('¡Bienvenida a tu backend de Querido Diario!');
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});

// All your other routes will now be covered by the CORS middleware
const contactoRoutes = require('./routes/contacto');
app.use('/api/contacto', contactoRoutes);

const clubRoutes = require('./routes/modulos/club');
app.use('/api/club', clubRoutes);

const muroRoutes = require('./routes/modulos/muro');
app.use('/api/muro', muroRoutes);

const mapaRoutes = require('./routes/modulos/mapa');
app.use('/api/mapa', mapaRoutes);

const perfilRoutes = require('./routes/perfil');
app.use('/api/perfil', perfilRoutes);

// ✅ Asegurar que usuarios.json exista al iniciar
const archivoUsuarios = path.join(__dirname, 'usuarios.json');
if (!fs.existsSync(archivoUsuarios)) {
  fs.writeFileSync(archivoUsuarios, '[]');
}

const archivoMuro = path.join(__dirname, 'muro.json');
if (!fs.existsSync(archivoMuro)) {
  fs.writeFileSync(archivoMuro, '[]');
}

// ✅ Importar rutas
const openaiRoutes = require('./openaiRoutes');
const publicacionesRoutes = require('./routes/publicaciones');
const retosRoutes = require('./routes/modulos/retos'); // Asegúrate que la ruta sea correcta
app.use('/api/retos', retosRoutes);

// ✅ Usar rutas
app.use('/api/openai', openaiRoutes);
app.use('/api/publicaciones', publicacionesRoutes);

// ✅ Funciones auxiliares
const cargarUsuarios = () => {
  try {
    const data = fs.readFileSync(archivoUsuarios, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const guardarUsuarios = (usuarios) => {
  fs.writeFileSync(archivoUsuarios, JSON.stringify(usuarios, null, 2));
};

// Registro
app.post('/api/register', (req, res) => {
  const usuarios = cargarUsuarios();
  const { nombre, email, password } = req.body;

  const existe = usuarios.find(u => u.email === email);
  if (existe) {
    return res.status(400).json({ error: 'El usuario ya existe' });
  }

  const nuevoUsuario = { nombre, email, password };
  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);
  res.json({ mensaje: 'Registro exitoso' });
});

// Login
app.post('/api/login', (req, res) => {
  const usuarios = cargarUsuarios();
  const { email, password } = req.body;

  const usuario = usuarios.find(u => u.email === email && u.password === password);
  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  res.json({ mensaje: 'Inicio de sesión exitoso', nombre: usuario.nombre, token: 'fake-token' });
});