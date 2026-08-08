const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzbpsvZXFY_Wv8Q4IYl0-dDZIC53RLXRgxttKf-8qWblMwIeiqxWDYGAxhIOS2y8hxtAg/exec"; 

let invitadoActual = null;
const WEDDING_DATE = new Date('October 3, 2026 16:30:00').getTime();

// Validar si viene un ID en la URL (?id=INV-101)
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const codeParam = urlParams.get('id');

  if (codeParam) {
    consultarInvitado(codeParam);
  }
});

function validarCodigo() {
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

  // Fade suave al salir de la pantalla de login
  loginScreen.style.opacity = '0';
  
  setTimeout(() => {
    loginScreen.classList.add('hidden');
    envelopeWrapper.classList.remove('hidden');
    envelopeWrapper.style.opacity = '1';
  }, 1000);
}

function abrirInvitacion() {
  const envelope = document.getElementById('envelope');
  
  // Audio de fondo
  const music = document.getElementById('bg-music');
  if (music) {
    music.volume = 0.7;
    music.play().catch(e => console.log("Audio en espera de interacción"));
    document.getElementById('audio-control').classList.remove('hidden');
  }

  // Animación del sobre
  envelope.classList.add('open');

  setTimeout(() => {
    document.getElementById('envelope-wrapper').style.opacity = '0';
    
    setTimeout(() => {
      document.getElementById('envelope-wrapper').classList.add('hidden');
      document.getElementById('wedding-content').classList.remove('hidden');
      
      iniciarCuentaRegresiva();
      CargarDatosFormulario();
      activarScrollReveal();
    }, 800);

  }, 600);
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

function activarScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach(el => el.classList.add('active'));

  window.addEventListener('scroll', () => {
    reveals.forEach(el => {
      const windowHeight = window.innerHeight;
      const elementTop = el.getBoundingClientRect().top;
      if (elementTop < windowHeight - 100) {
        el.classList.add('active');
      }
    });
  });
}