const { createApp } = Vue;

createApp({
  data() {
    return {
      // variables// 
        seccion: 'inicio',
        filtroTipo: 'todos', // ⬅️ AÑADE ESTO

      nuevaCritica: '',
      tipoAporteClub: '', // Nuevo campo para el selector del club
      criticasClub: [],
      tipoSeleccionado: 'Todos',


      muro: [],
      nuevaPublicacionMuro: '',
      marcas: [], // Aquí se guardan las marcas de todos los escritores
      coordenadasUsuario: null,
      mensajeMapa: '',
      mapa: null,
      mensajeMapa: '',
      ubicacionMapa: null,
      mensajesMapa: [],
      filtroPais: '',
      filtroCiudad: '',
      publicacionesMuro: [],           // Publicaciones del muro
      nuevasRespuestas: {},            // Texto por ca


      retoActual: null,
      escribiendoReto: false,
      respuestaReto: '',
      retosCompletados: [],
      detalleReto: null,
      insignias: [],


      rachaEscritura: 0,
      ultimaEscritura: null,
      contenidoEscrito: '',
      escritosGuardados: [],
      categoriaSeleccionada: null,
      todosMisEscritos: [],
      tipoRespuesta: '',


      seccion: 'inicio',
      usuarioAutenticado: true, // Set to false if users should always log in

      totalPalabras: 0,
      chart: null,

      publicacionesInteracciones: [],
      publicaciones: [], // las publicaciones vendrán del backend


      registro: {
        nombre: '',
        email: '',
        password: '',
        error: ''
      },
      usuarioAutenticado: false,
      usuario: {},
      

      bioActual: '',
      historialBios: [],






      metas: [
        { texto: 'Escribir al menos 3 veces por semana', completado: 1, total: 3 },
        { texto: 'Completar 5 retos de escritura', completado: 2, total: 5 },
        { texto: 'Compartir 3 publicaciones públicas', completado: 1, total: 3 }
      ],
      nuevaMeta: {
        texto: '',
        total: 1,
      },
    
      usuario: {
        nombre: '',
        email: '',
        bio: '',
        estadoEmocional: ''
      },
      
      login: {
        email: '',
        password: '',
        error: ''
      },

      form: {
        nombre: '',
        email: '',
        mensaje: ''
      },

      retosDisponibles: [
        {
          id: 1,
          tipo: "emocional",
          nivel: "profundo",
          titulo: "Carta sin destinatario",
          descripcion: "Escribe una carta que nunca planeas enviar.",
          imagen: null
        },
        {
          id: 2,
          tipo: "visual",
          nivel: "creativo",
          titulo: "Dibuja con palabras",
          descripcion: "Describe con detalle lo que ves en esta imagen.",
          imagen: "img/reto1.jpg" // Make sure this path is correct
        },
        {
          id: 3,
          tipo: "flujo",
          nivel: "experimental",
          titulo: "Escribe sin borrar",
          descripcion: "Durante 5 minutos, escribe sin editar ni borrar nada.",
          imagen: null
        }
      ],

      nuevaParticipacion: {
        tipo: '',
        texto: ''
      },

      temaDelMes: {
        titulo: 'La soledad en la literatura',
        descripcion: 'Reflexiona sobre cómo los personajes enfrentan la soledad en distintas novelas.',
        frase: '“La soledad es la gran talladora del espíritu” – Federico García Lorca'
      },

    };
  },

  computed: {
    tituloAporteClub() {
      switch (this.tipoAporteClub) {
        case 'frase': return '📖 Compartir frase';
        case 'debate': return '📢 Abrir debate';
        case 'opinion': return '🧠 Compartir opinión sobre el tema del mes';
        case 'critica': return '📝 Compartir microcrítica';
        default: return '📝 Compartir aporte';
      }
    },
    
    filteredCriticas() {
      if (this.filtroTipo === 'todos') return this.criticasClub;
      return this.criticasClub.filter(c => c.tipo.toLowerCase() === this.filtroTipo.toLowerCase());
    },
        insigniasUsuarios() {
      const conteo = this.contarPublicacionesPorUsuario();
      const insignias = {};
      
      for (const usuario in conteo) {
        const cantidad = conteo[usuario];
        if (cantidad >= 10) insignias[usuario] = '🌟 Experto';
        else if (cantidad >= 5) insignias[usuario] = '✍️ Participante Activo';
        else insignias[usuario] = '🧡 Nuevo miembro';
      }
    
      return insignias;
    }
    
    
  },

  watch: {
    seccion(nuevaSeccion) {
      if (nuevaSeccion === 'mapa') {
        this.$nextTick(() => {
          this.obtenerUbicacion();
        });
      }
    }
  },
  
  methods: {
    
    enviarMensaje() {
      if (!this.form.nombre || !this.form.email || !this.form.mensaje) {
        alert("Por favor, completa todos los campos.");
        return;
      }
    
      // Aquí puedes enviar el mensaje a tu backend o solo mostrar un mensaje de éxito
      alert(`Gracias por tu mensaje, ${this.form.nombre}! Te responderé pronto.`);
    
      // Resetear el formulario
      this.form.nombre = '';
      this.form.email = '';
      this.form.mensaje = '';
    },
    
    cambiarSeccion(nueva) {
      this.seccion = nueva;

    
      if (nueva === 'progreso') {
        this.calcularProgreso();
      }
    
      this.$nextTick(() => {
        if (nueva === 'progreso') this.generarGraficoProgreso();
      });
    
      if (nueva === 'misEscritos') {
        this.cargarMisEscritos();
      } else if (nueva === 'interacciones') {
        this.cargarPublicaciones();
      } else if (nueva === 'retos') {
        this.cargarRetosCompletados();
      } else if (nueva === 'club') {
        this.obtenerCriticasClub();
      } else if (nueva === 'muro') {
        this.cargarMuro();
      } else if (nueva === 'mapa') {
        this.$nextTick(() => {
          this.inicializarMapa();
          this.cargarMensajesMapa();
          this.obtenerUbicacion();
        });
      }
    
      window.location.hash = nueva;
    },

    // interactua con otros 
    darLikeInteracciones(pub) {
      pub.likes++;
      fetch(`http://localhost:3000/api/publicaciones/${pub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likes: pub.likes })
      })
        .then(res => {
          if (!res.ok) throw new Error("No se pudo actualizar el like");
        })
        .catch(err => console.error("Error al actualizar like:", err));
    },
        toggleFavorito(pub) {
      pub.favorito = !pub.favorito;
      this.actualizarPublicacion(pub);
    },
    actualizarPublicacion(pub) {
      fetch(`/api/publicaciones/${pub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          likes: pub.likes,
          favorito: pub.favorito
        })
      })
      .then(res => {
        if (!res.ok) throw new Error("No se pudo actualizar");
      })
      .catch(err => console.error(err));
    },
    async publicarCritica() {
      if (!this.nuevaCritica.trim()) return;
    
      const ahora = new Date();
    
      const nueva = {
        usuario: this.usuario.nombre || 'Anónimo',
        texto: this.nuevaCritica.trim(),
        tipo: this.tipoAporteClub || 'general',
        fecha: ahora.toLocaleDateString(),
        hora: ahora.toLocaleTimeString(),
        favorito: false,
        likes: 0,
        respuestas: [],
        nuevaRespuesta: '',
        mostrarRespuestas: false
      };
    
      try {
        const res = await fetch('https://blog-interactivo.onrender.com/api/club', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nueva)
        });
    
        if (!res.ok) throw new Error('❌ Error al guardar en Club');
    
        const data = await res.json();
    
        // Agregar la nueva crítica y resetear el campo
        this.criticasClub.unshift({
          ...data,
          nuevaRespuesta: '',
          mostrarRespuestas: false
        });
    
        this.nuevaCritica = '';
    
        // 🔁 Recargar si hace falta
        await this.obtenerCriticasClub();
    
        // También publicar en interacciones
        this.publicarEnInteracciones({
          contenido: data.texto,
          tipo: data.tipo
        });
    
      } catch (err) {
        console.error('❌ Error al publicar en el Club:', err);
        alert('❌ Error al publicar en el Club');
      }
    },
     
    
    async publicarEnInteracciones(escrito) {
      const nueva = {
        autor: this.usuario.nombre || 'Anónimo',
        contenido: escrito.contenido,
        tipo: escrito.tipo || 'General',
        fecha: new Date().toISOString(),
        favorito: false, // añadimos campo para botón
        likes: 0,
        comentarios: []
      };
    
      console.log('📝 Publicando en interacciones:', nueva);
    
      try {
        const res = await fetch('https://blog-interactivo.onrender.com/api/publicaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nueva)
        });
    
        const data = await res.json();
    
        if (res.ok) {
          alert('✅ Publicado en Interacciones');
    
          // Mostrar también en sección de retos
          this.retosCompletados.push({
            ...nueva,
            titulo: nueva.tipo,
            respuesta: nueva.contenido,
            fecha: nueva.fecha,
            favorito: false
          });
    
          this.cargarPublicaciones(); // actualiza interacciones
    
        } else {
          alert(`❌ Error al publicar: ${data.error}`);
        }
    
      } catch (err) {
        console.error('❌ Error al publicar en interacciones:', err);
        alert('❌ Error de red al intentar publicar');
      }
    },
            
    async cargarPublicaciones() {
      try {
        const res = await fetch('https://blog-interactivo.onrender.com/api/publicaciones');
        const data = await res.json();
        this.publicaciones = data.map(pub => ({
          ...pub,
          nuevoComentario: '',
          comentarios: pub.comentarios || []
        }));
        console.log('✅ Publicaciones cargadas:', this.publicaciones);
      } catch (error) {
        console.error('Error al cargar publicaciones:', error);
      }
    },

    cambiarAInteracciones() {
      this.seccion = 'interacciones';
      this.cargarPublicaciones(); // ✅ aseguramos que se vean
    },
    
    
    toggleFavorito(pub) {
      pub.favorito = !pub.favorito;
      // Aquí también podrías guardar esta preferencia en backend
    },
    comentarPublicacion(pub) {
      if (!pub.nuevoComentario || pub.nuevoComentario.trim() === "") {
        alert("Escribe un comentario válido.");
        return;
      }
  
      if (!pub.comentarios) pub.comentarios = [];
      pub.comentarios.push(pub.nuevoComentario.trim());
      pub.nuevoComentario = '';
    },

 // seccion progreso
    calcularProgreso() {
      this.totalPalabras = this.escritosGuardados.reduce((total, escrito) => {
        return total + (escrito.contenido ? escrito.contenido.split(' ').length : 0);
      }, 0);
    },

    generarGraficoProgreso() {
      const dias = {};
    
      this.escritosGuardados.forEach(e => {
        const fecha = e.fecha || 'Sin fecha';
        const palabras = e.contenido ? e.contenido.split(' ').length : 0;
        dias[fecha] = (dias[fecha] || 0) + palabras;
      });
    
      const labels = Object.keys(dias);
      const data = Object.values(dias);
    
      const ctx = document.getElementById('graficoProgreso').getContext('2d');
    
      if (this.chart) {
        this.chart.destroy();
      }
    
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: '📘 Palabras por día',
            data: data,
            backgroundColor: (context) => {
              const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, '#a3d5ff');
              gradient.addColorStop(1, '#e6f2ff');
              return gradient;
            },
            borderColor: '#4899db',
            borderWidth: 2,
            borderRadius: 12,
            barThickness: 40
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: 20
          },
          plugins: {
            legend: {
              labels: {
                font: {
                  size: 14,
                  family: 'Inter'
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `✍️ ${context.parsed.y} palabras`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                font: {
                  size: 12,
                  family: 'Inter'
                }
              },
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 10,
                font: {
                  size: 12,
                  family: 'Inter'
                }
              },
              grid: {
                color: '#f0f0f0'
              }
            }
          }
        }
      });
    },

    agregarMeta() {
      if (!this.nuevaMeta.texto || this.nuevaMeta.total < 1) {
        alert('Completa todos los campos de la nueva meta');
        return;
      }
    
      this.metas.push({
        texto: this.nuevaMeta.texto,
        completado: 0,
        total: this.nuevaMeta.total
      });
    
      this.nuevaMeta.texto = '';
      this.nuevaMeta.total = 1;
    },
    
    eliminarMeta(index) {
      if (confirm('¿Eliminar esta meta?')) {
        this.metas.splice(index, 1);
      }
    },
    
    
   // Mis escritos
    cargarMisEscritos() {
      this.todosMisEscritos = [
        ...this.escritosGuardados.map(e => ({
          id: e.id || Date.now() + Math.random(),
          titulo: e.tipo.toUpperCase(),
          contenido: e.contenido,
          fecha: e.fecha || 'Sin fecha',
          origen: 'Categorías'
        })),
        ...this.retosCompletados.map(r => ({
          id: r.id || Date.now() + Math.random(),
          titulo: r.titulo,
          contenido: r.respuesta,
          fecha: r.fecha || 'Sin fecha',
          origen: 'Retos de Escritura'
        })),
        ...this.criticasClub.map(c => ({
          id: c.id || Date.now() + Math.random(),
          titulo: 'Aporte en Club',
          contenido: c.texto,
          fecha: c.fecha || 'Sin fecha',
          origen: 'Club de Escritura'
        }))
      ];
    },
    
    
    // mapa de escritores 
    aplicarFiltroMapa() {
      const pais = this.filtroPais.toLowerCase();
      const ciudad = this.filtroCiudad.toLowerCase();
    
      const filtrados = this.mensajesMapa.filter(m => {
        const ciudadMatch = ciudad ? m.ciudad?.toLowerCase().includes(ciudad) : true;
        const paisMatch = pais ? m.pais?.toLowerCase().includes(pais) : true;
        return ciudadMatch && paisMatch;
      });
    
      this.pintarMensajesFiltrados(filtrados);
    },
    
    limpiarFiltroMapa() {
      this.filtroPais = '';
      this.filtroCiudad = '';
      this.pintarMensajesFiltrados(this.mensajesMapa);
    },
    
    pintarMensajesFiltrados(lista) {
      if (this.mapa) {
        this.mapa.eachLayer(layer => {
          if (layer instanceof L.Marker) {
            this.mapa.removeLayer(layer);
          }
        });
    
        lista.forEach(m => {
          const marcador = L.marker([m.lat, m.lng]).addTo(this.mapa);
          marcador.bindPopup(`<strong>${m.usuario}</strong><br>${m.ciudad}, ${m.pais}<br><em>"${m.mensaje}"</em>`);
        });
      }
    },
    
    inicializarMapa() {
      this.mapa = L.map('mapa').setView([20, 0], 2); // Vista global inicial
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.mapa);
    },

    publicarMarca() {
      if (!this.coordenadasUsuario || !this.mensajeMapa) return;
    
      const nueva = {
        nombre: this.usuario.nombre,
        mensaje: this.mensajeMapa,
        lat: this.coordenadasUsuario.lat,
        lng: this.coordenadasUsuario.lng
      };
    
      fetch('https://blog-interactivo.onrender.com/api/mapa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nueva)
      })
        .then(res => res.json())
        .then(() => {
          this.marcas.push(nueva);
          L.marker([nueva.lat, nueva.lng])
            .addTo(this.mapa)
            .bindPopup(`<strong>${nueva.nombre}</strong><br>${nueva.mensaje}`);
          this.mensajeMapa = '';
        });
    },
    async cargarMarcasMapa() {
      try {
        const res = await fetch('https://blog-interactivo.onrender.com/api/mapa');
        const data = await res.json();
        this.marcas = data;
    
        data.forEach(m => {
          const marcador = L.marker([m.lat, m.lng]).addTo(this.mapa);
          marcador.bindPopup(`<strong>${m.usuario}</strong><br>${m.mensaje}`);
        });
    
      } catch (err) {
        console.error('❌ Error al cargar marcas:', err);
      }
    },
    async enviarMensajeMapa() {
      if (!this.mensajeMapa.trim()) return;
    
      try {
        const coords = this.ultimaUbicacion || { lat: 0, lng: 0 }; // última ubicación obtenida
        const nuevoMensaje = {
          usuario: this.usuario.nombre || 'Anónimo',
          mensaje: this.mensajeMapa.trim(),
          lat: coords.lat,
          lng: coords.lng
        };
    
        const res = await fetch('http://localhost:3000/api/mapa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoMensaje)
        });
    
        const guardado = await res.json();
        this.mensajesMapa.push(guardado); // Mostrarlo de inmediato
        this.agregarMarcadorMapa(guardado); // Ponerlo en el mapa
        this.mensajeMapa = '';
    
      } catch (err) {
        console.error('❌ Error al enviar mensaje del mapa:', err);
      }
    },

    agregarMarcadorMapa(mensaje) {
      if (!this.mapa) return;
    
      const marker = new google.maps.Marker({
        position: { lat: mensaje.lat, lng: mensaje.lng },
        map: this.mapa,
        title: mensaje.usuario
      });
    
      const info = new google.maps.InfoWindow({
        content: `<strong>${mensaje.usuario}</strong><br>${mensaje.mensaje}`
      });
    
      marker.addListener('click', () => {
        info.open(this.mapa, marker);
      });
    },
    obtenerUbicacion() {
      if (!navigator.geolocation) {
        alert('La geolocalización no es compatible con este navegador.');
        return;
      }
    
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.coordenadasUsuario = { lat, lng };
    
          // 🌍 Inicializar el mapa en ese punto
          if (!this.mapa) {
            this.mapa = L.map('mapa').setView([lat, lng], 5);
    
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(this.mapa);
          }
    
          // 🔴 Mostrar todas las marcas existentes
          this.mensajesMapa.forEach(m => {
            if (m.lat && m.lng) {
              L.marker([m.lat, m.lng])
                .addTo(this.mapa)
                .bindPopup(`${m.usuario}: "${m.mensaje}"`);
            }
          });
        },
        error => {
          alert('No se pudo obtener tu ubicación.');
          console.error(error);
        }
      );
    },
            
    async publicarMensajeMapa() {
      if (!this.mensajeMapa.trim() || !this.ubicacionMapa) {
        alert('Escribe un mensaje y permite acceder a tu ubicación.');
        return;
      }
    
      const nuevo = {
        usuario: this.usuario.nombre || 'Anónimo',
        mensaje: this.mensajeMapa.trim(),
        ciudad: this.ubicacionMapa.ciudad,
        pais: this.ubicacionMapa.pais,
        lat: this.ubicacionMapa.lat,
        lng: this.ubicacionMapa.lng
      };
    
      try {
        const res = await fetch('https://blog-interactivo.onrender.com/api/mapa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevo)
        });
        const data = await res.json();
        this.mensajesMapa.push(data);
        this.mensajeMapa = '';
        alert('✅ Mensaje publicado en el mapa');
      } catch (err) {
        console.error('❌ Error al publicar en el mapa:', err);
      }
    },
    async cargarMensajesMapa() {
      try {
        const res = await fetch('https://blog-interactivo.onrender.com/api/mapa');
        const data = await res.json();
        this.mensajesMapa = data;
      } catch (err) {
        console.error('❌ Error al cargar mensajes del mapa:', err);
      }
      this.$nextTick(() => {
        this.pintarMensajesEnMapa();
      });
      
    },
    
    pintarMensajesEnMapa() {
      const mapa = L.map('mapa-escritores').setView([20, 0], 2); // vista inicial global
    
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '🌍 OpenStreetMap contributors'
      }).addTo(mapa);
    
      this.mensajesMapa.forEach(m => {
        if (m.lat && m.lng) {
          const marcador = L.marker([m.lat, m.lng]).addTo(mapa);
          marcador.bindPopup(`<strong>${m.usuario}</strong><br>${m.ciudad}, ${m.pais}<br><em>"${m.mensaje}"</em>`);
        }
      });
    },
    async cargarMuro() {
      try {
        const res = await fetch('https://blog-interactivo.onrender.com//api/muro');
        const data = await res.json();
        this.publicacionesMuro = data;
      } catch (err) {
        console.error('❌ Error al cargar el muro:', err);
      }
    },
  

    // Reaccionar (❤️ 💭 🔁)
    async darReaccion(id, tipo) {
      try {
        await fetch(`http://localhost:3000/api/muro/${id}/reaccion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo })
        });
        this.cargarMuro();
      } catch (err) {
        console.error('❌ Error al dar reacción:', err);
      }
    },
  
    // Responder a una publicación
    async responderPublicacion(id) {
      const texto = this.nuevasRespuestas[id];
      if (!texto) return;
  
      try {
        await fetch(`https://blog-interactivo.onrender.com/api/muro/${id}/responder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario: this.usuario.nombre,
            texto
          })
        });
        this.nuevasRespuestas[id] = '';
        this.cargarMuro();
      } catch (err) {
        console.error('❌ Error al responder publicación:', err);
      }
    },
    
        
    
    
    // 📥 Cargar muro
    async cargarMuro() {
  try {
    const res = await fetch('https://blog-interactivo.onrender.com/api/muro');
    const data = await res.json();
    this.muro = data;
  } catch (err) {
    console.error('❌ Error al cargar muro:', err);
  }
    },

    async publicarEnMuro() {
      const texto = this.nuevaPublicacionMuro.trim();
      if (!texto) return;
    
      const nueva = {
        usuario: this.usuario.nombre || 'Anónimo',
        texto: texto
      };
    
      try {
        // 1️⃣ Guardar en el muro normalmente
        const res = await fetch('https://blog-interactivo.onrender.com/api/muro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nueva)
        });
        const pub = await res.json();
        this.muro.unshift(pub);
        this.nuevaPublicacionMuro = '';
    
        // 2️⃣ También guardar en Interacciones
        await this.publicarEnInteracciones({
          tipo: 'MuroComunitario',
          contenido: texto
        });
    
      } catch (err) {
        console.error('❌ Error al publicar en muro o interacciones:', err);
      }
    },
    
    async reaccionarMuro(pub, tipo) {
  try {
    const res = await fetch(`https://blog-interactivo.onrender.com/api/muro/${pub.id}/reaccion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo })
    });
    const actualizada = await res.json();
    pub.reacciones = actualizada.reacciones;
  } catch (err) {
    console.error('❌ Error al reaccionar:', err);
  }
    },

    async responderMuro(pub) {
  if (!pub.nuevaRespuesta || !pub.nuevaRespuesta.trim()) return;

  const respuesta = {
    usuario: this.usuario.nombre || 'Anónimo',
    texto: pub.nuevaRespuesta.trim()
  };

  try {
    const res = await fetch(`https://blog-interactivo.onrender.com/api/muro/${pub.id}/responder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(respuesta)
    });
    const actualizado = await res.json();
    pub.respuestas = actualizado.respuestas;
    pub.nuevaRespuesta = '';
  } catch (err) {
    console.error('❌ Error al responder:', err);
  }
    },




    // --- Club de Escritura Methods ---
    darLikeClub(id) {
      fetch(`https://blog-interactivo.onrender.com/api/club/${critica.id}/like`, {
        method: 'POST'
  })
    .then(res => res.json())
    .then(data => {
      const pub = this.criticasClub.find(p => p.id === id);
      if (pub) {
        pub.likes = data.likes;
      }
    })
    .catch(err => {
      console.error('Error al dar like:', err);
    });
    },
    enviarRespuesta(critica) {
      if (!critica.nuevaRespuesta || !critica.nuevaRespuesta.trim()) return;
    
      const nueva = {
        usuario: this.usuario.nombre || 'Anónimo',
        texto: critica.nuevaRespuesta.trim()
      };
    
      fetch(`https://blog-interactivo.onrender.com/api/club/${critica.id}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nueva)
      })
        .then(res => res.json())
        .then(actualizada => {
          critica.respuestas = actualizada.respuestas;
          critica.nuevaRespuesta = '';
        })
        .catch(err => console.error('Error al responder crítica:', err));
    },
        
    obtenerCriticasClub() {
      fetch('http://127.0.0.1:3000/api/club')
        .then(res => res.json())
        .then(data => {
          this.criticasClub = data;
          this.criticasClub = data.map(c => ({
            ...c,
            favorito: c.favorito || false,
            likes: c.likes || 0,
            respuestas: c.respuestas || [],
            nuevaRespuesta: '',
            mostrarRespuestas: false
          }));
          
        })
        .catch(err => console.error('Error al cargar críticas del club:', err));
    },

    contarPublicacionesPorUsuario() {
      const conteo = {};
      this.criticasClub.forEach(pub => {
        if (!conteo[pub.usuario]) conteo[pub.usuario] = 0;
        conteo[pub.usuario]++;
      });
      return conteo;
    },
    toggleFavorito(pub) {
      pub.favorito = !pub.favorito;
    
      const endpoint = pub.tipo === 'General' || pub.tipo === 'Interacción'
        ? `/api/publicaciones/${pub.id}`
        : `/api/club/${pub.id}`;
    
      fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorito: pub.favorito })
      })
      .then(res => {
        if (!res.ok) throw new Error("No se pudo actualizar favorito");
      })
      .catch(err => console.error(err));
    },
    
    
    

    // --- Retos de Escritura Methods ---
    verDetalleReto(index) {
      // Se crea una copia del reto para edición sin modificar el original aún
      this.detalleReto = { ...this.retosCompletados[index], index };
    },

    guardarEdicionReto() {
      if (this.detalleReto) { // Ensure detalleReto exists
        const { index, respuesta } = this.detalleReto;
        this.retosCompletados[index].respuesta = respuesta;
        alert('✅ Cambios guardados');
        this.detalleReto = null;
      }
    },

    eliminarReto() {
      if (this.detalleReto) { // Ensure detalleReto exists
        const confirmacion = confirm('¿Estás segura de que quieres eliminar este reto?');
        if (confirmacion) {
          this.retosCompletados.splice(this.detalleReto.index, 1);
          this.detalleReto = null;
          alert('🗑️ Reto eliminado');
        }
      }
    },

    mostrarRetoAleatorio() {
      console.log('🔍 Se ejecutó mostrarRetoAleatorio()');
      if (this.retosDisponibles.length === 0) {
        alert('No hay retos disponibles para mostrar.');
        return;
      }
      const indice = Math.floor(Math.random() * this.retosDisponibles.length);
      this.retoActual = this.retosDisponibles[indice];
      this.escribiendoReto = false;
      this.respuestaReto = '';
    },

    aceptarReto() {
      this.escribiendoReto = true;
    },

    async guardarReto(tipo) {
      if (!this.retoActual || this.respuestaReto.trim() === '') {
        alert('Por favor, selecciona un reto y escribe tu respuesta.');
        return;
      }

      const hoy = new Date().toLocaleDateString();

      // Agrega reto
      const retoGuardado = {
        ...this.retoActual,
        respuesta: this.respuestaReto,
        fecha: hoy,
        tipoGuardado: tipo
      };
      this.retosCompletados.push(retoGuardado);

      // Guardar también en backend
      try {
        const res = await fetch('https://blog-interactivo.onrender.com/api/retos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(retoGuardado)
        });
        const data = await res.json();
        console.log('✅ Reto guardado en backend:', data);
      } catch (err) {
        console.error('❌ Error al guardar reto en backend:', err);
      }

      // Verifica racha diaria
      if (this.ultimaEscritura !== hoy) {
        const ayer = new Date(Date.now() - 86400000).toLocaleDateString(); // 86400000 ms = 24 horas
        if (this.ultimaEscritura === ayer) {
          this.rachaEscritura += 1;
        } else {
          this.rachaEscritura = 1;
        }
        this.ultimaEscritura = hoy;
      }

      // Verifica insignias por cantidad
      const total = this.retosCompletados.length;
      if (total >= 5 && !this.insignias.includes('Constancia 5')) {
        this.insignias.push('Constancia 5');
      }
      if (total >= 10 && !this.insignias.includes('Valiente 10')) {
        this.insignias.push('Valiente 10');
      }
      if (total >= 20 && !this.insignias.includes('Leyenda 20')) {
        this.insignias.push('Leyenda 20');
      }

      // Reset
      this.retoActual = null;
      this.escribiendoReto = false;
      this.respuestaReto = '';
      alert(`¡Reto guardado como ${tipo}!`);
    },

    abrirEspacioCreativo(tipo) {
      this.tipoRespuesta = tipo;
      this.seccion = 'espacio-creativo-detalle';
      // Call the AI helper if needed for specific creative types
      // this.pedirAyudaIA(tipo);
    },

    actualizarReto() {
      this.mensajeUsuario = '';
      this.contenidoEscrito = '';
      // This seems to be related to regenerating AI content for creative space
      this.pedirAyudaIA(this.tipoRespuesta);
    },
    async comentarPublicacion(pub) {
      const comentario = pub.nuevoComentario.trim();
      if (comentario === '') return;

      // Add locally for immediate feedback
      if (!pub.comentarios) {
        pub.comentarios = [];
      }
      pub.comentarios.push(comentario);

      // Clear the input
      pub.nuevoComentario = '';

      // Save to backend
      try {
        await fetch(`https://blog-interactivo.onrender.com/api/comentar/${pub.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comentario })
        });
        console.log('✅ Comentario enviado');
      } catch (err) {
        console.error('❌ Error al comentar:', err);
      }
    },

    async cargarRetosCompletados() {
      try {
        const res = await fetch('https://blog-interactivo.onrender.com/api/retos');
        const data = await res.json();
        this.retosCompletados = data;
        console.log('✅ Retos cargados del backend:', data);
      } catch (err) {
        console.error('❌ Error al cargar retos completados:', err);
      }
    },



    // --- perfil ---
    async guardarEstadoEmocional() {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('email');
      const hoy = new Date().toISOString().slice(0, 10);
    
      const entrada = {
        fecha: hoy,
        texto: this.usuario.estadoEmocional || 'No definido'
      };
    
      try {
        const res = await fetch('https://blog-interactivo.onrender.com/api/perfil', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ entrada, email }) // ✅ aquí lo corregiste
        });
    
        const data = await res.json();
    
        if (res.ok) {
          alert('✅ Estado emocional actualizado en servidor');
        } else {
          alert('❌ Error: ' + data.error);
        }
      } catch (err) {
        console.error('❌ Error al guardar estado emocional:', err);
        alert('❌ Error al guardar estado emocional');
      }
    },
    
    async registrarUsuario() {
      try {
        const response = await fetch('https://blog-interactivo.onrender.com/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.registro)
        });
    
        const data = await response.json();
    
        if (response.ok) {
          // Guardar datos en localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('nombre', data.nombre || this.registro.nombre);
          localStorage.setItem('email', this.registro.email);  // ✅ AQUI
    
          // Establecer usuario actual
          this.usuario = {
            nombre: data.nombre || this.registro.nombre,
            email: this.registro.email,
            bio: ''
          };
    
          this.usuarioAutenticado = true;
          this.seccion = 'perfil';
    
          // Limpiar campos de registro
          this.registro = {
            nombre: '',
            email: '',
            password: '',
            error: ''
          };
        } else {
          this.registro.error = data.mensaje || 'Error al registrarse.';
        }
      } catch (error) {
        console.error('Error al registrar:', error);
        this.registro.error = 'Error de conexión con el servidor.';
      }
    },
    
    async iniciarSesion() {
      try {
        const response = await fetch('https://blog-interactivo.onrender.com/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.login)
        });
        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('nombre', data.nombre || 'Mi Usuario'); // Store name if provided
          localStorage.setItem('email', this.login.email);

          this.usuario = {
            nombre: data.nombre || 'Mi Usuario',
            email: this.login.email,
            bio: localStorage.getItem('bio') || ''
          };
          this.usuarioAutenticado = true;
          this.seccion = 'perfil';
          this.login = { email: '', password: '', error: '' };
        } else {
          this.login.error = data.error || 'Credenciales incorrectas';
        }
      } catch (err) {
        console.error('Error de conexión al iniciar sesión:', err);
        this.login.error = 'Error de conexión con el servidor.';
      }
    },

    cerrarSesion() {
      localStorage.clear(); // Clear all local storage related to the user
      this.usuario = { nombre: '', email: '', bio: '' };
      this.usuarioAutenticado = false;
      this.seccion = 'inicio';
      window.location.hash = 'inicio'; // Ensure URL hash reflects the change
    },

    async guardarBio() {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('email'); // <-- AÑADE ESTO
      const hoy = new Date().toISOString().slice(0, 10);
    
      const nuevaEntrada = {
        fecha: hoy,
        texto: this.bioActual
      };
    
      try {
        const res = await fetch('https://blog-interactivo.onrender.com/api/perfil', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            entrada: nuevaEntrada,
            email: email     // <-- AÑADE ESTO
          })
        });
    
        const data = await res.json();
    
        if (res.ok) {
          this.historialBios.push(nuevaEntrada);
          this.bioActual = '';
          alert('✅ Entrada guardada');
        } else {
          alert('❌ Error al guardar: ' + data.error);
        }
    
      } catch (err) {
        console.error('❌ Error de red:', err);
        alert('❌ No se pudo conectar con el servidor.');
      }
    },
                                    

        
    async cargarPerfil() {
      try {
        const email = localStorage.getItem('email');
        const res = await fetch('https://blog-interactivo.onrender.com/api/perfil');
        const data = await res.json();
    
        if (data[email]) {
          const usuarioData = data[email];
          this.usuario = {
            nombre: usuarioData.nombre || '',
            email: usuarioData.email || '',
            bio: usuarioData.bio || '',
            estadoEmocional: usuarioData.estadoEmocional || ''
          };
    
          this.historialBio = usuarioData.bios || [];
        } else {
          this.historialBio = [];
        }
      } catch (err) {
        console.error('❌ Error al cargar perfil:', err);
      }
    },
        


    // --- General Writing Methods ---
    guardarEscrito(tipoDeEscrito) {
      if (this.contenidoEscrito.trim() === '') {
        alert('No puedes publicar un texto vacío.');
        return;
      }

      this.escritosGuardados.push({
        id: Date.now(),
        contenido: this.contenidoEscrito,
        tipo: tipoDeEscrito,
        fecha: new Date().toLocaleDateString()
      });
      this.contenidoEscrito = '';

      alert(`Tu ${tipoDeEscrito} ha sido publicado.`);
      console.log('Escritos guardados:', this.escritosGuardados);
      // Optional: Navigate to misEscritos after saving
      // this.seccion = 'misEscritos';
    },

    async publicarComoPublico() {
      try {
        const autor = this.usuario.nombre || 'Anónimo'; // Use a default if name is not set
        const contenido = this.contenidoEscrito;
        const tipo = this.categoriaSeleccionada;
        const fecha = new Date().toISOString();

        if (!autor || !contenido || !tipo) {
          alert('❗ Faltan campos obligatorios para publicar.');
          return;
        }

        console.log({ autor, contenido, tipo, fecha });

        const response = await fetch('https://blog-interactivo.onrender.com/api/publicar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ autor, contenido, tipo, fecha })
        });

        const data = await response.json();
        if (response.ok) {
          alert('✅ Tu publicación ahora es pública');
          await this.cargarPublicaciones();
          this.seccion = 'publicaciones';
        } else {
          alert(`❌ Error al publicar: ${data.error || 'Desconocido'}`);
        }
      } catch (err) {
        console.error('Error al publicar:', err);
        alert('❌ Error de conexión al intentar publicar.');
      }
    },


    async pedirAyudaIA(tipo, entrada = '') {
      try {
        const response = await fetch('https://blog-interactivo.onrender.com/api/openai/generar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo, entrada })
        });

        const data = await response.json();
        this.mensajeUsuario = data.respuesta;
        this.tipoRespuesta = tipo;
      } catch (error) {
        this.mensajeUsuario = "Error al generar contenido. Intenta nuevamente.";
        this.tipoRespuesta = tipo;
        console.error('Error calling OpenAI API:', error);
      }
    }
  },  

  mounted() {
        // Verificación de token y datos guardados
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('email');
        const userName = localStorage.getItem('nombre');
        const userBio = localStorage.getItem('bio');
        const userEstado = localStorage.getItem('estadoEmocional');

        if (token && userEmail && userName) {
          this.usuarioAutenticado = true;
          this.usuario = {
            nombre: userName,
            email: userEmail,
            bio: userBio || '',
            estadoEmocional: userEstado || ''
          };
          this.cargarPerfil();
        } else {
          this.usuarioAutenticado = false;
        }
    
    
        fetch('https://blog-interactivo.onrender.com/api/perfil')
        .then(res => res.json())
        .then(data => {
          if (data && data.email) {
            this.usuario = {
              nombre: data.nombre,
              email: data.email,
              bio: data.bio,
              estadoEmocional: data.estadoEmocional
            };
            localStorage.setItem('nombre', data.nombre);
            localStorage.setItem('email', data.email);
            localStorage.setItem('bio', data.bio);
            localStorage.setItem('estadoEmocional', data.estadoEmocional);
          }
        })
        .catch(err => {
          console.error('❌ Error al cargar perfil:', err);
        });
  
  
    // Leer hash
    let hash = window.location.hash.replace('#', '');
    this.seccion = (hash === '' || hash === '/') ? 'inicio' : hash;
  
    // Escuchar cambios de hash
    window.addEventListener('hashchange', () => {
      let nuevaSeccion = window.location.hash.replace('#', '');
      this.seccion = (nuevaSeccion === '' || nuevaSeccion === '/') ? 'inicio' : nuevaSeccion;
      console.log('Sección actualizada por hashchange:', this.seccion);
  
      fetch('https://blog-interactivo.onrender.com/api/retos')
      .then(res => res.json())
        .then(data => {
          this.publicaciones = data.map(pub => ({
            ...pub,
            likes: pub.likes || 0,
            favorito: pub.favorito || false,
            nuevoComentario: ''
          }));
        });
  
      if (this.seccion === 'publicaciones') this.cargarPublicaciones();
      if (this.seccion === 'retos') this.cargarRetosCompletados();
      if (this.seccion === 'misEscritos') this.cargarMisEscritos();
      if (this.seccion === 'muro') this.cargarMuro();
      if (this.seccion === 'club') this.obtenerCriticasClub();
      if (this.seccion === 'interacciones') this.cargarPublicaciones();
    });
  
    // Cargar mapa si existe
    this.$nextTick(() => {
      if (document.getElementById('mapa')) this.iniciarMapa();
    });
  
    this.cargarMensajesMapa();
  
    // Retos (por si se accede sin cambiar hash)
    if (this.usuarioAutenticado) {
      this.cargarRetosCompletados();
    }
  }
  
  

}).mount('#app');