const { createApp } = Vue;

createApp({
  data() {
    return {
      tipoRespuesta: '',
      seccion: 'inicio',
      usuarioAutenticado: true, // Set to false if users should always log in

      usuario: {
        nombre: '',
        email: '',
        bio: ''
      },
      registro: {
        nombre: '',
        email: '',
        password: '',
        error: ''
      },
      login: {
        email: '',
        password: '',
        error: ''
      },

      contenidoEscrito: '',
      escritosGuardados: [],
      categoriaSeleccionada: null,

      form: {
        nombre: '',
        email: '',
        mensaje: ''
      },
      publicaciones: [],


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

      retoActual: null,
      escribiendoReto: false,
      respuestaReto: '',
      retosCompletados: [],

      detalleReto: null,
      insignias: [],
      rachaEscritura: 0,
      ultimaEscritura: null,

      nuevaParticipacion: {
        tipo: '',
        texto: ''
      },

      temaDelMes: {
        titulo: 'La soledad en la literatura',
        descripcion: 'Reflexiona sobre cómo los personajes enfrentan la soledad en distintas novelas.',
        frase: '“La soledad es la gran talladora del espíritu” – Federico García Lorca'
      },
      nuevaCritica: '',
      criticasClub: [],
      tipoSeleccionado: 'Todos',

      muro: [],
      nuevaPublicacionMuro: '',

      mensajeMapa: '',
      marcas: [], // Aquí se guardan las marcas de todos los escritores

      coordenadasUsuario: null,
      mensajeMapa: '',
      marcas: [],
      mapa: null,

      mensajeMapa: '',
      ubicacionMapa: null,
      mensajesMapa: [], 

      filtroPais: '',
      filtroCiudad: '',

      publicacionesMuro: [],           // Publicaciones del muro
      nuevasRespuestas: {},            // Texto por cada publicación para responder

    };
  },

  computed: {
    filteredCriticas() {
      if (this.filtroTipo === 'todos') return this.criticasClub;
      return this.criticasClub.filter(c => c.tipo === this.filtroTipo);
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

  methods: {
    

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
    
      fetch('http://localhost:3000/api/mapa', {
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
        const res = await fetch('http://localhost:3000/api/mapa');
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
    
    async obtenerUbicacion() {
      try {
        navigator.geolocation.getCurrentPosition(async pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
    
          // Llamada a OpenStreetMap para obtener ciudad y país
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          const ciudad = data.address.city || data.address.town || data.address.village || 'Ciudad desconocida';
          const pais = data.address.country || 'País desconocido';
    
          this.ubicacionMapa = { ciudad, pais, lat, lng };
        }, err => {
          alert('No se pudo obtener tu ubicación.');
          console.error(err);
        });
      } catch (error) {
        console.error('Error al obtener ubicación:', error);
      }
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
        const res = await fetch('http://localhost:3000/api/mapa', {
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
        const res = await fetch('http://localhost:3000/api/mapa');
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
        const res = await fetch('http://localhost:3000/api/muro');
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
        await fetch(`http://localhost:3000/api/muro/${id}/responder`, {
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
    const res = await fetch('http://localhost:3000/api/muro');
    const data = await res.json();
    this.muro = data;
  } catch (err) {
    console.error('❌ Error al cargar muro:', err);
  }
    },

// 📝 Publicar en el muro
async publicarEnMuro() {
  if (!this.nuevaPublicacionMuro.trim()) return;

  const nueva = {
    usuario: this.usuario.nombre || 'Anónimo',
    texto: this.nuevaPublicacionMuro.trim()
  };

  try {
    const res = await fetch('http://localhost:3000/api/muro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nueva)
    });
    const pub = await res.json();
    this.muro.unshift(pub);
    this.nuevaPublicacionMuro = '';
  } catch (err) {
    console.error('❌ Error al publicar en muro:', err);
  }
},

// ❤️ 💭 🔁 Reaccionar
async reaccionarMuro(pub, tipo) {
  try {
    const res = await fetch(`http://localhost:3000/api/muro/${pub.id}/reaccion`, {
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

// 💬 Responder
async responderMuro(pub) {
  if (!pub.nuevaRespuesta || !pub.nuevaRespuesta.trim()) return;

  const respuesta = {
    usuario: this.usuario.nombre || 'Anónimo',
    texto: pub.nuevaRespuesta.trim()
  };

  try {
    const res = await fetch(`http://localhost:3000/api/muro/${pub.id}/responder`, {
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
    publicarCritica() {
      console.log('Intentando publicar:', this.nuevaCritica);

      if (!this.nuevaCritica.trim()) return;
    
      const nueva = {
        usuario: this.usuario.nombre || 'Anónimo',
        texto: this.nuevaCritica.trim(),
        tipo: 'microcritica'
      };
    
      fetch('http://127.0.0.1:3000/api/club', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nueva)
      })
        .then(res => res.json())
        .then(pub => {
          this.criticasClub.unshift(pub);
          this.nuevaCritica = '';
        })
        .catch(err => console.error('Error al publicar crítica:', err));
    },
        
    darLike(critica) {
      fetch(`http://127.0.0.1:3000/api/club/${critica.id}/like`, {
        method: 'POST'
      })
        .then(res => res.json())
        .then(actualizada => {
          critica.likes = actualizada.likes;
        })
        .catch(err => console.error('Error al dar like:', err));
    },
        
    enviarRespuesta(critica) {
      if (!critica.nuevaRespuesta || !critica.nuevaRespuesta.trim()) return;
    
      const nueva = {
        usuario: this.usuario.nombre || 'Anónimo',
        texto: critica.nuevaRespuesta.trim()
      };
    
      fetch(`http://127.0.0.1:3000/api/club/${critica.id}/responder`, {
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
        const res = await fetch('http://localhost:3000/api/retos', {
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

    
    // --- General Navigation and Data Loading ---
    cambiarSeccion(nuevaSeccion) {
      this.seccion = nuevaSeccion;
      console.log('✅ Sección actual:', this.seccion);    

      // Load data relevant to the new section
      if (this.seccion === 'publicaciones') {
        this.cargarPublicaciones();
      } else if (this.seccion === 'interacciones') {
        // Assuming interacciones might also use publicacion data
        this.cargarPublicaciones();
      } else if (this.seccion === 'retos') {
        this.cargarRetosCompletados(); // Corrected method name
      } else if (this.seccion === 'club') {
        // You'd need a method like this.cargarParticipacionesClub();
      }
     else if (this.seccion === 'muro') {
      this.muro = data.map(pub => ({
        ...pub,
        reacciones: pub.reacciones || { corazon: 0, comentario: 0, compartir: 0 },
        respuestas: pub.respuestas || [],
        nuevaRespuesta: ''
      }));
      
      }
      if (nuevaSeccion === 'mapa') {
      this.initMapa();
      this.cargarMensajesMapa();
      this.obtenerUbicacion(); // <-- ESTA LÍNEA ES LA CLAVE
      }
      
        
      // Update the URL hash for direct linking/bookmarking
      window.location.hash = nuevaSeccion;
    },


    // --- Publicaciones Methods ---
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
        await fetch(`http://localhost:3000/api/comentar/${pub.id}`, {
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
        const res = await fetch('http://localhost:3000/api/retos');
        const data = await res.json();
        this.retosCompletados = data;
        console.log('✅ Retos cargados del backend:', data);
      } catch (err) {
        console.error('❌ Error al cargar retos completados:', err);
      }
    },

    // --- Authentication Methods ---
    async registrarUsuario() {
      try {
        const response = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.registro)
        });
        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('nombre', data.nombre || 'Mi Usuario');
          localStorage.setItem('email', this.registro.email); // Use registro.email for the new user

          this.usuario = {
            nombre: data.nombre || 'Mi Usuario',
            email: this.registro.email, // Corrected
            bio: localStorage.getItem('bio') || ''
          };

          this.usuarioAutenticado = true;
          this.seccion = 'perfil';
          this.login = { email: '', password: '', error: '' }; // Clear login form
          this.registro = { nombre: '', email: '', password: '', error: '' }; // Clear registration form
        } else {
          this.registro.error = data.error || 'Error al registrar';
        }
      } catch (err) {
        console.error('Error de conexión al registrar:', err);
        this.registro.error = 'Error de conexión con el servidor.';
      }
    },

    async iniciarSesion() {
      try {
        const response = await fetch('http://localhost:3000/api/login', {
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

    guardarBio() {
      localStorage.setItem('bio', this.usuario.bio);
      alert('Biografía guardada con éxito.');
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

        const response = await fetch('http://localhost:3000/api/publicar', {
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

    async cargarPublicaciones() {
      try {
        const res = await fetch('http://localhost:3000/api/publicaciones');
        const data = await res.json();
        this.publicaciones = data.map(pub => ({
          ...pub,
          nuevoComentario: '',
          comentarios: pub.comentarios || [] // Ensure comments array exists
        }));
        console.log('✅ Publicaciones cargadas:', this.publicaciones);
      } catch (error) {
        console.error('Error al cargar publicaciones:', error);
      }
    },

    async pedirAyudaIA(tipo, entrada = '') {
      try {
        const response = await fetch('http://localhost:3000/api/openai/generar', {
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
  // Verificación de token y usuario
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');
  const userName = localStorage.getItem('nombre');
  const userBio = localStorage.getItem('bio');

  if (token && userEmail) {
    this.usuarioAutenticado = true;
    this.usuario = {
      nombre: userName || 'Mi Usuario',
      email: userEmail,
      bio: userBio || ''
    };
  } else {
    this.usuarioAutenticado = false;
  }

  // Inicializar sección según hash
  let hash = window.location.hash.replace('#', '');
  this.seccion = (hash === '' || hash === '/') ? 'inicio' : hash;

  if (this.usuarioAutenticado) {
    this.cargarRetosCompletados();
  }
  if (this.seccion === 'muro') {
    this.cargarMuro();
  }
  

  // Escuchar cambios en el hash
  window.addEventListener('hashchange', () => {
    let nuevaSeccion = window.location.hash.replace('#', '');
    this.seccion = (nuevaSeccion === '' || nuevaSeccion === '/') ? 'inicio' : nuevaSeccion;
    console.log('Sección actualizada por hashchange:', this.seccion);

    if (this.seccion === 'publicaciones') {
      this.cargarPublicaciones();
    } else if (this.seccion === 'retos') {
      this.cargarRetosCompletados();
    }
  });

  // Cargar publicaciones si aplica
  if (this.seccion === 'publicaciones') {
    this.cargarPublicaciones();
  } else if (this.seccion === 'retos' && this.usuarioAutenticado) {
    this.cargarRetosCompletados();
  }

  // ✅ Este era el que estaba ignorado
  if (this.seccion === 'club') {
    this.obtenerCriticasClub();
  }
  else if (this.seccion === 'muro') {
    this.cargarMuro(); // CORRECTO
  }
    this.$nextTick(() => {
    if (document.getElementById('mapa')) {
      this.iniciarMapa();
    }
  });
  
  this.cargarMensajesMapa();

  if (nueva === 'muro') {
    this.cargarMuro();
  }



  

},
  

}).mount('#app');