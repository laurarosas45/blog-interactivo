// openaiRoutes.js
require('dotenv').config();
console.log("CLAVE:", process.env.OPENAI_API_KEY);

const express = require('express');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const router = express.Router();

router.post('/generar', async (req, res) => {
  const { tipo, entrada } = req.body;
  console.log("📥 Tipo recibido:", tipo);
  console.log("📥 Entrada recibida:", entrada);

  try {
    let prompt = '';

    switch (tipo) {
      case 'palabras':
        prompt = 'Dame tres palabras aleatorias para inspirarme a escribir.';
        break;
      case 'continuar':
        prompt = `Continúa esta historia: ${entrada}`;
        break;
      case 'pregunta':
        prompt = 'Dame una pregunta profunda para reflexionar en un diario personal.';
        break;
        case 'imagen':
            prompt = `Describe de manera visual y detallada esta imagen, como si fuera una fotografía: ${entrada}`;
            break;
      case 'mensajeContacto':
        prompt = `Este es un mensaje enviado por un visitante del sitio web: "${entrada}"`;
        break;
      default:
        prompt = entrada;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    // 👇 CORREGIDA ESTA LÍNEA
    res.json({ respuesta: completion.choices[0].message.content });

  } catch (error) {
    console.error('❌ Error completo:', error);
    res.status(500).json({ error: 'Error al generar texto con OpenAI' });
  }
});

module.exports = router;
