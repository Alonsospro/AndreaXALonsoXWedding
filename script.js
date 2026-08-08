const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzbpsvZXFY_Wv8Q4IYl0-dDZIC53RLXRgxttKf-8qWblMwIeiqxWDYGAxhIOS2y8hxtAg/exec"; 

let invitadoActual = null;
const WEDDING_DATE = new Date('October 3, 2026 17:15:00').getTime();

// Iniciar partículas (corazones y anillos)
window.addEventListener('DOMContentLoaded', () => {
  crearParticulas();

  const urlParams = new URLSearchParams(window.location.search);
  const codeParam = urlParams.get('id');

  if (codeParam) {
    consultarInvitado(codeParam);
  }
});

// Forzar pantalla completa al primer clic/interacción
function solicitarPantallaCompleta() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log("Pantalla completa omitida o no soportada:", err.message);
    });
  }
}

function validarCodigo() {
  solicitarPantallaCompleta();

  const inputCode = document.getElementById('guest-code').value.trim();
  const errorElement = document.getElementById('error-message');
  const spinner = document.getElementById('loading-spinner');
  const btn = document.getElementById('btn-login');

  if (!inputCode) {
    errorElement.textContent = "ASEGURATE DE INGRESAR EL CODIGO UNICO QUE TE ENVIAMOS";
    return;
  }

  errorElement.textContent = "";
  spinner.classList.remove('hidden');
  btn.classList.add('hidden');

  consultarInvitado(inputCode);
}

function consultarInvitado(codigo) {
  const spinner = document.getElementById('loading-spinner');
  const btn = document.getElementById('btn-login');

  fetch(`${APPS_SCRIPT_URL}?id=${encodeURIComponent(codigo)}`, {
    method: "GET",
    redirect: "follow"
  })
    .then(response => {
      if (!response.ok) throw new Error("Error de red");
      return response.json();
    })
    .then(result => {
      spinner.classList.add('hidden');
      btn.classList.remove('hidden');

      if (result.success) {
        invitadoActual = result.data;
        transicionASobre(invitadoActual.nombre);
      } else {
        document.getElementById('error-message').textContent = "ASEGURATE DE INGRESAR EL CODIGO UNICO QUE TE ENVIAMOS";
      }
    })
    .catch(error => {
      console.error("Error Fetch:", error);
      spinner.classList.add('hidden');
      btn.classList.remove('hidden');
      document.getElementById('error-message').textContent = "ASEGURATE DE INGRESAR EL CODIGO UNICO QUE TE ENVIAMOS";
    });
}

function transicionASobre(nombreInvitado) {
  const loginScreen = document.getElementById('login-screen');
  const envelopeWrapper = document.getElementById('envelope-wrapper');

  document.getElementById('guest-name-display').textContent = nombreInvitado;

  loginScreen.style.opacity = '0';
  
  setTimeout(() => {
    loginScreen.classList.add('hidden');
    envelopeWrapper.classList.remove('hidden');
    envelopeWrapper.style.opacity = '1';
  }, 1000);
}

function abrirInvitacion() {
  solicitarPantallaCompleta();

  const envelope = document.getElementById('envelope');
  
  const music = document.getElementById('bg-music');
  if (music) {
    music.volume = 0.7;
    music.play().catch(e => console.log("Audio en espera de interacción"));
    document.getElementById('audio-control').classList.remove('hidden');
  }

  envelope.classList.add('open');

  setTimeout(() => {
    document.getElementById('envelope-wrapper').style.opacity = '0';
    
    setTimeout(() => {
      document.getElementById('envelope-wrapper').classList.add('hidden');
      document.getElementById('wedding-content').classList.remove('hidden');
      
      iniciarCuentaRegresiva();
      CargarDatosFormulario();
      activarScrollFadeEffect();
    }, 800);

  }, 600);
}

// Lluvia de corazones y anillos
function crearParticulas() {
  const container = document.getElementById('particles-container');
  const items = ['💕', '💍', '❤️', '🥂'];

  setInterval(() => {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.innerHTML = items[Math.floor(Math.random() * items.length)];
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.animationDuration = Math.random() * 3 + 4 + 's';
    
    container.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 7000);
  }, 400);
}

// Modal Regalo QR
function abrirModalQR() {
  document.getElementById('qr-modal').classList.remove('hidden');
}

function cerrarModalQR() {
  document.getElementById('qr-modal').classList.add('hidden');
}

// Cuenta Regresiva
function iniciarCuentaRegresiva() {
  setInterval(() => {
    const now = new Date().getTime();
    const distance = WEDDING_DATE - now;

    if (distance < 0) return;

    document.getElementById('days').innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
    document.getElementById('hours').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    document.getElementById('minutes').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    document.getElementById('seconds').innerText = Math.floor((distance % (1000 * 60)) / 1000);
  }, 1000);
}

// Formulario RSVP
function CargarDatosFormulario() {
  if (!invitadoActual) return;

  if (invitadoActual.yaRespondio) {
    document.getElementById('rsvp-form').classList.add('hidden');
    document.getElementById('rsvp-already-confirmed').classList.remove('hidden');
    document.getElementById('summary-text').innerHTML = `
      <strong>Iglesia:</strong> ${invitadoActual.asistenciaIglesia}<br>
      <strong>Fiesta:</strong> ${invitadoActual.asistenciaFiesta} (${invitadoActual.pasesFiesta} pases)
    `;
    return;
  }

  document.getElementById('rsvp-guest-title').textContent = `Hola, ${invitadoActual.nombre}`;
  document.getElementById('pases-max-info').textContent = `Pases asignados: ${invitadoActual.pasesAsignados}`;

  const select = document.getElementById('pases-select');
  select.innerHTML = '';
  for (let i = 1; i <= invitadoActual.pasesAsignados; i++) {
    let opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = `${i} pase(s)`;
    if (i === invitadoActual.pasesAsignados) opt.selected = true;
    select.appendChild(opt);
  }
}

function togglePases(asistira) {
  const group = document.getElementById('pases-selector-group');
  if (asistira) {
    group.classList.remove('hidden');
  } else {
    group.classList.add('hidden');
  }
}

function enviarRSVP() {
  const btn = document.getElementById('btn-submit-rsvp');
  const statusMsg = document.getElementById('rsvp-status-msg');

  const churchVal = document.querySelector('input[name="church"]:checked').value;
  const partyVal = document.querySelector('input[name="party"]:checked').value;
  const pasesVal = partyVal === "Asistirá" ? parseInt(document.getElementById('pases-select').value) : 0;

  btn.disabled = true;
  btn.textContent = "Guardando...";

  const payload = {
    id: invitadoActual.id,
    asistenciaIglesia: churchVal,
    asistenciaFiesta: partyVal,
    pasesFiesta: pasesVal
  };

  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      document.getElementById('rsvp-form').classList.add('hidden');
      document.getElementById('rsvp-already-confirmed').classList.remove('hidden');
      document.getElementById('summary-text').innerHTML = `
        <strong>Iglesia:</strong> ${churchVal}<br>
        <strong>Fiesta:</strong> ${partyVal} (${pasesVal} pases)
      `;
    } else {
      statusMsg.textContent = data.message;
      btn.disabled = false;
      btn.textContent = "CONFIRMAR ASISTENCIA";
    }
  })
  .catch(err => {
    console.error(err);
    statusMsg.textContent = "Error de red. Intenta nuevamente.";
    btn.disabled = false;
    btn.textContent = "CONFIRMAR ASISTENCIA";
  });
}

// Efecto Scroll Fade Suave al Deslizar
function activarScrollFadeEffect() {
  const reveals = document.querySelectorAll('.reveal');

  const checkScroll = () => {
    const windowHeight = window.innerHeight;
    
    reveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top;
      const elementBottom = rect.bottom;

      // Aparece al entrar en vista
      if (elementTop < windowHeight - 80 && elementBottom > 80) {
        el.classList.add('active');
        el.classList.remove('fade-out');
      } 
      // Se desvanece suavemente si queda muy arriba fuera de pantalla
      else if (elementBottom <= 80) {
        el.classList.add('fade-out');
      } 
      else {
        el.classList.remove('active');
      }
    });
  };

  checkScroll();
  window.addEventListener('scroll', checkScroll);
}

// Reproductor
function toggleMute() {
  const music = document.getElementById('bg-music');
  const btn = document.getElementById('mute-btn');
  music.muted = !music.muted;
  btn.textContent = music.muted ? "🔇" : "🔊";
}

function changeVolume(value) {
  const music = document.getElementById('bg-music');
  music.volume = value;
}
