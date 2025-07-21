const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

// POST /api/contacto
router.post('/', async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Configura el transporte de nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USUARIO,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Contenido del mensaje
  const mailOptions = {
    from: `"${nombre}" <${email}>`,
    to: process.env.EMAIL_DESTINO, // tu correo real
    subject: 'Nuevo mensaje desde tu sitio web',
    text: `Nombre: ${nombre}\nEmail: ${email}\nMensaje:\n${mensaje}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ mensaje: 'Correo enviado correctamente' });
  } catch (err) {
    console.error('❌ Error al enviar correo:', err);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

module.exports = router;
