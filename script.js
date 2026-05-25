/* ============================================
   CALCULADORA DE MAGNITUDES FÍSICAS
   script.js - Lógica y Validaciones
   ============================================ */

'use strict';

// ---- HISTORIAL DE CÁLCULOS ----
let calcHistory = JSON.parse(localStorage.getItem('calcHistory') || '[]');

// ---- NAVEGACIÓN DE TABS ----
function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      switchSection(target);
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

function switchSection(sectionId) {
  document.querySelectorAll('.calc-section, .overview-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');
}

function goToSection(sectionId) {
  switchSection(sectionId);
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(t => {
    if (t.dataset.target === sectionId) t.classList.add('active');
    else t.classList.remove('active');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- VALIDACIONES ----
function validateInput(value, fieldName, options = {}) {
  const { allowNegative = true, allowZero = true, min = null, max = null } = options;

  if (value === '' || value === null || value === undefined) {
    return { valid: false, message: `${fieldName} es requerido` };
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} debe ser un número válido` };
  }

  if (!allowNegative && num < 0) {
    return { valid: false, message: `${fieldName} no puede ser negativo` };
  }

  if (!allowZero && num === 0) {
    return { valid: false, message: `${fieldName} no puede ser cero` };
  }

  if (min !== null && num < min) {
    return { valid: false, message: `${fieldName} debe ser mayor a ${min}` };
  }

  if (max !== null && num > max) {
    return { valid: false, message: `${fieldName} debe ser menor a ${max}` };
  }

  return { valid: true, value: num };
}

function showError(inputEl, errorEl, message) {
  inputEl.classList.add('input-error');
  inputEl.classList.remove('input-valid');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }
}

function showValid(inputEl, errorEl) {
  inputEl.classList.remove('input-error');
  inputEl.classList.add('input-valid');
  if (errorEl) errorEl.classList.remove('show');
}

function clearInputState(inputEl, errorEl) {
  inputEl.classList.remove('input-error', 'input-valid');
  if (errorEl) errorEl.classList.remove('show');
}

function formatNumber(num) {
  if (Math.abs(num) >= 1e6 || (Math.abs(num) < 0.001 && num !== 0)) {
    return num.toExponential(4);
  }
  return parseFloat(num.toFixed(6)).toString();
}

// ---- MOSTRAR RESULTADO ----
function showResult(resultBoxId, type, value, unit, description, icon = '⚡') {
  const box = document.getElementById(resultBoxId);
  if (!box) return;

  box.className = `result-box ${type}`;

  if (type === 'success') {
    box.innerHTML = `
      <div class="result-label">✓ Resultado Calculado</div>
      <div class="result-value">${value} <small style="font-size:0.55em;color:rgba(255,255,255,0.5)">${unit}</small></div>
      <div class="result-desc">${description}</div>
      <div class="result-icon">${icon}</div>
    `;
  } else if (type === 'error') {
    box.innerHTML = `
      <div class="result-label">✗ Error de Validación</div>
      <div class="result-value" style="font-size:1.1rem;color:#ef4444">${value}</div>
      <div class="result-icon">⚠️</div>
    `;
  } else if (type === 'warning') {
    box.innerHTML = `
      <div class="result-label">⚠ Advertencia</div>
      <div class="result-value" style="font-size:1.1rem;color:#f59e0b">${value}</div>
      <div class="result-icon">⚠️</div>
    `;
  }
}

// ---- HISTORIAL ----
function addToHistory(calcName, params, result, unit) {
  const entry = {
    id: Date.now(),
    name: calcName,
    params: params,
    result: `${result} ${unit}`,
    timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  };
  calcHistory.unshift(entry);
  if (calcHistory.length > 20) calcHistory.pop();
  localStorage.setItem('calcHistory', JSON.stringify(calcHistory));
  renderHistory();
  updateStats();
}

function renderHistory() {
  const list = document.getElementById('history-list');
  if (!list) return;

  if (calcHistory.length === 0) {
    list.innerHTML = '<div class="history-empty">📭 No hay cálculos registrados aún</div>';
    return;
  }

  list.innerHTML = calcHistory.map(item => `
    <div class="history-item">
      <div class="hi-left">
        <strong>${item.name}</strong>
        ${item.params} — <em style="color:rgba(255,255,255,0.4);font-size:0.78rem">${item.timestamp}</em>
      </div>
      <div class="hi-result">${item.result}</div>
    </div>
  `).join('');
}

function clearHistory() {
  if (confirm('¿Deseas limpiar todo el historial de cálculos?')) {
    calcHistory = [];
    localStorage.removeItem('calcHistory');
    renderHistory();
    updateStats();
  }
}

function updateStats() {
  const el = document.getElementById('stat-calcs');
  if (el) el.textContent = calcHistory.length;
}

// ============================================================
// 1. VELOCIDAD  v = d / t
// ============================================================
function calcVelocidad() {
  const dInput = document.getElementById('vel-d');
  const tInput = document.getElementById('vel-t');
  const dErr = document.getElementById('vel-d-err');
  const tErr = document.getElementById('vel-t-err');
  let valid = true;

  const dVal = validateInput(dInput.value, 'Distancia', { allowNegative: false, allowZero: false });
  const tVal = validateInput(tInput.value, 'Tiempo', { allowNegative: false, allowZero: false });

  if (!dVal.valid) { showError(dInput, dErr, dVal.message); valid = false; }
  else showValid(dInput, dErr);

  if (!tVal.valid) { showError(tInput, tErr, tVal.message); valid = false; }
  else showValid(tInput, tErr);

  if (!valid) {
    showResult('vel-result', 'error', 'Verifica los campos ingresados', '', '');
    return;
  }

  const result = dVal.value / tVal.value;
  const formatted = formatNumber(result);

  showResult('vel-result', 'success', formatted, 'm/s',
    `Velocidad = ${dVal.value} m ÷ ${tVal.value} s = ${formatted} m/s`, '🚀');

  addToHistory('Velocidad', `d=${dVal.value}m, t=${tVal.value}s`, formatted, 'm/s');
}

// ============================================================
// 2. ACELERACIÓN  a = Δv / Δt
// ============================================================
function calcAceleracion() {
  const dvInput = document.getElementById('acel-dv');
  const dtInput = document.getElementById('acel-dt');
  const dvErr = document.getElementById('acel-dv-err');
  const dtErr = document.getElementById('acel-dt-err');
  let valid = true;

  const dvVal = validateInput(dvInput.value, 'Δv (cambio de velocidad)');
  const dtVal = validateInput(dtInput.value, 'Δt (cambio de tiempo)', { allowNegative: false, allowZero: false });

  if (!dvVal.valid) { showError(dvInput, dvErr, dvVal.message); valid = false; }
  else showValid(dvInput, dvErr);

  if (!dtVal.valid) { showError(dtInput, dtErr, dtVal.message); valid = false; }
  else showValid(dtInput, dtErr);

  if (!valid) {
    showResult('acel-result', 'error', 'Verifica los campos ingresados', '', '');
    return;
  }

  const result = dvVal.value / dtVal.value;
  const formatted = formatNumber(result);

  showResult('acel-result', 'success', formatted, 'm/s²',
    `Aceleración = ${dvVal.value} m/s ÷ ${dtVal.value} s = ${formatted} m/s²`, '⚡');

  addToHistory('Aceleración', `Δv=${dvVal.value}m/s, Δt=${dtVal.value}s`, formatted, 'm/s²');
}

// ============================================================
// 3. FUERZA  F = m · a
// ============================================================
function calcFuerza() {
  const mInput = document.getElementById('fuerza-m');
  const aInput = document.getElementById('fuerza-a');
  const mErr = document.getElementById('fuerza-m-err');
  const aErr = document.getElementById('fuerza-a-err');
  let valid = true;

  const mVal = validateInput(mInput.value, 'Masa', { allowNegative: false, allowZero: false });
  const aVal = validateInput(aInput.value, 'Aceleración');

  if (!mVal.valid) { showError(mInput, mErr, mVal.message); valid = false; }
  else showValid(mInput, mErr);

  if (!aVal.valid) { showError(aInput, aErr, aVal.message); valid = false; }
  else showValid(aInput, aErr);

  if (!valid) {
    showResult('fuerza-result', 'error', 'Verifica los campos ingresados', '', '');
    return;
  }

  const result = mVal.value * aVal.value;
  const formatted = formatNumber(result);

  showResult('fuerza-result', 'success', formatted, 'N (Newtons)',
    `Fuerza = ${mVal.value} kg × ${aVal.value} m/s² = ${formatted} N`, '💪');

  addToHistory('Fuerza', `m=${mVal.value}kg, a=${aVal.value}m/s²`, formatted, 'N');
}

// ============================================================
// 4. TRABAJO  W = F · d · cos(θ)
// ============================================================
function calcTrabajo() {
  const fInput = document.getElementById('trab-f');
  const dInput = document.getElementById('trab-d');
  const tInput = document.getElementById('trab-theta');
  const fErr = document.getElementById('trab-f-err');
  const dErr = document.getElementById('trab-d-err');
  const tErr = document.getElementById('trab-theta-err');
  let valid = true;

  const fVal = validateInput(fInput.value, 'Fuerza');
  const dVal = validateInput(dInput.value, 'Distancia', { allowNegative: false });
  const thetaVal = validateInput(tInput.value, 'Ángulo θ', { min: 0, max: 360 });

  if (!fVal.valid) { showError(fInput, fErr, fVal.message); valid = false; }
  else showValid(fInput, fErr);

  if (!dVal.valid) { showError(dInput, dErr, dVal.message); valid = false; }
  else showValid(dInput, dErr);

  if (!thetaVal.valid) { showError(tInput, tErr, thetaVal.message); valid = false; }
  else showValid(tInput, tErr);

  if (!valid) {
    showResult('trab-result', 'error', 'Verifica los campos ingresados', '', '');
    return;
  }

  const thetaRad = (thetaVal.value * Math.PI) / 180;
  const result = fVal.value * dVal.value * Math.cos(thetaRad);
  const formatted = formatNumber(result);

  showResult('trab-result', 'success', formatted, 'J (Joules)',
    `Trabajo = ${fVal.value}N × ${dVal.value}m × cos(${thetaVal.value}°) = ${formatted} J`, '🔧');

  addToHistory('Trabajo', `F=${fVal.value}N, d=${dVal.value}m, θ=${thetaVal.value}°`, formatted, 'J');
}

// ============================================================
// 5. ENERGÍA CINÉTICA  K = ½ · m · v²
// ============================================================
function calcEnergiaCinetica() {
  const mInput = document.getElementById('ec-m');
  const vInput = document.getElementById('ec-v');
  const mErr = document.getElementById('ec-m-err');
  const vErr = document.getElementById('ec-v-err');
  let valid = true;

  const mVal = validateInput(mInput.value, 'Masa', { allowNegative: false, allowZero: false });
  const vVal = validateInput(vInput.value, 'Velocidad');

  if (!mVal.valid) { showError(mInput, mErr, mVal.message); valid = false; }
  else showValid(mInput, mErr);

  if (!vVal.valid) { showError(vInput, vErr, vVal.message); valid = false; }
  else showValid(vInput, vErr);

  if (!valid) {
    showResult('ec-result', 'error', 'Verifica los campos ingresados', '', '');
    return;
  }

  const result = 0.5 * mVal.value * Math.pow(vVal.value, 2);
  const formatted = formatNumber(result);

  showResult('ec-result', 'success', formatted, 'J (Joules)',
    `Ec = ½ × ${mVal.value}kg × (${vVal.value}m/s)² = ${formatted} J`, '⚡');

  addToHistory('Energía Cinética', `m=${mVal.value}kg, v=${vVal.value}m/s`, formatted, 'J');
}

// ============================================================
// 6. ENERGÍA POTENCIAL GRAVITATORIA  U = m · g · h
// ============================================================
function calcEnergiaPotencial() {
  const mInput = document.getElementById('ep-m');
  const gInput = document.getElementById('ep-g');
  const hInput = document.getElementById('ep-h');
  const mErr = document.getElementById('ep-m-err');
  const gErr = document.getElementById('ep-g-err');
  const hErr = document.getElementById('ep-h-err');
  let valid = true;

  const mVal = validateInput(mInput.value, 'Masa', { allowNegative: false, allowZero: false });
  const gVal = validateInput(gInput.value, 'Gravedad', { allowNegative: false, allowZero: false });
  const hVal = validateInput(hInput.value, 'Altura', { allowNegative: false });

  if (!mVal.valid) { showError(mInput, mErr, mVal.message); valid = false; }
  else showValid(mInput, mErr);

  if (!gVal.valid) { showError(gInput, gErr, gVal.message); valid = false; }
  else showValid(gInput, gErr);

  if (!hVal.valid) { showError(hInput, hErr, hVal.message); valid = false; }
  else showValid(hInput, hErr);

  if (!valid) {
    showResult('ep-result', 'error', 'Verifica los campos ingresados', '', '');
    return;
  }

  const result = mVal.value * gVal.value * hVal.value;
  const formatted = formatNumber(result);

  showResult('ep-result', 'success', formatted, 'J (Joules)',
    `U = ${mVal.value}kg × ${gVal.value}m/s² × ${hVal.value}m = ${formatted} J`, '🌍');

  addToHistory('Energía Potencial', `m=${mVal.value}kg, g=${gVal.value}, h=${hVal.value}m`, formatted, 'J');
}

// ============================================================
// 7. DENSIDAD  ρ = m / V
// ============================================================
function calcDensidad() {
  const mInput = document.getElementById('den-m');
  const vInput = document.getElementById('den-v');
  const mErr = document.getElementById('den-m-err');
  const vErr = document.getElementById('den-v-err');
  let valid = true;

  const mVal = validateInput(mInput.value, 'Masa', { allowNegative: false, allowZero: false });
  const vVal = validateInput(vInput.value, 'Volumen', { allowNegative: false, allowZero: false });

  if (!mVal.valid) { showError(mInput, mErr, mVal.message); valid = false; }
  else showValid(mInput, mErr);

  if (!vVal.valid) { showError(vInput, vErr, vVal.message); valid = false; }
  else showValid(vInput, vErr);

  if (!valid) {
    showResult('den-result', 'error', 'Verifica los campos ingresados', '', '');
    return;
  }

  if (vVal.value === 0) {
    showResult('den-result', 'error', 'El volumen no puede ser cero (división por cero)', '', '');
    return;
  }

  const result = mVal.value / vVal.value;
  const formatted = formatNumber(result);

  showResult('den-result', 'success', formatted, 'kg/m³',
    `ρ = ${mVal.value}kg ÷ ${vVal.value}m³ = ${formatted} kg/m³`, '🧪');

  addToHistory('Densidad', `m=${mVal.value}kg, V=${vVal.value}m³`, formatted, 'kg/m³');
}

// ============================================================
// 8. PRESIÓN  P = F / A
// ============================================================
function calcPresion() {
  const fInput = document.getElementById('pres-f');
  const aInput = document.getElementById('pres-a');
  const fErr = document.getElementById('pres-f-err');
  const aErr = document.getElementById('pres-a-err');
  let valid = true;

  const fVal = validateInput(fInput.value, 'Fuerza', { allowNegative: false });
  const aVal = validateInput(aInput.value, 'Área', { allowNegative: false, allowZero: false });

  if (!fVal.valid) { showError(fInput, fErr, fVal.message); valid = false; }
  else showValid(fInput, fErr);

  if (!aVal.valid) { showError(aInput, aErr, aVal.message); valid = false; }
  else showValid(aInput, aErr);

  if (!valid) {
    showResult('pres-result', 'error', 'Verifica los campos ingresados', '', '');
    return;
  }

  if (aVal.value === 0) {
    showResult('pres-result', 'error', 'El área no puede ser cero (división por cero)', '', '');
    return;
  }

  const result = fVal.value / aVal.value;
  const formatted = formatNumber(result);

  showResult('pres-result', 'success', formatted, 'Pa (Pascales)',
    `P = ${fVal.value}N ÷ ${aVal.value}m² = ${formatted} Pa`, '🔵');

  addToHistory('Presión', `F=${fVal.value}N, A=${aVal.value}m²`, formatted, 'Pa');
}

// ============================================================
// 9. CARGA ELÉCTRICA  q = I · t
// ============================================================
function calcCargaElectrica() {
  const iInput = document.getElementById('carga-i');
  const tInput = document.getElementById('carga-t');
  const iErr = document.getElementById('carga-i-err');
  const tErr = document.getElementById('carga-t-err');
  let valid = true;

  const iVal = validateInput(iInput.value, 'Corriente', { allowNegative: false, allowZero: false });
  const tVal = validateInput(tInput.value, 'Tiempo', { allowNegative: false, allowZero: false });

  if (!iVal.valid) { showError(iInput, iErr, iVal.message); valid = false; }
  else showValid(iInput, iErr);

  if (!tVal.valid) { showError(tInput, tErr, tVal.message); valid = false; }
  else showValid(tInput, tErr);

  if (!valid) {
    showResult('carga-result', 'error', 'Verifica los campos ingresados', '', '');
    return;
  }

  const result = iVal.value * tVal.value;
  const formatted = formatNumber(result);

  showResult('carga-result', 'success', formatted, 'C (Coulombs)',
    `q = ${iVal.value}A × ${tVal.value}s = ${formatted} C`, '⚡');

  addToHistory('Carga Eléctrica', `I=${iVal.value}A, t=${tVal.value}s`, formatted, 'C');
}

// ============================================================
// 10. LEY DE OHM  V = I · R
// ============================================================
function calcLeyOhm() {
  const iInput = document.getElementById('ohm-i');
  const rInput = document.getElementById('ohm-r');
  const iErr = document.getElementById('ohm-i-err');
  const rErr = document.getElementById('ohm-r-err');
  let valid = true;

  const iVal = validateInput(iInput.value, 'Corriente', { allowNegative: false, allowZero: false });
  const rVal = validateInput(rInput.value, 'Resistencia', { allowNegative: false, allowZero: false });

  if (!iVal.valid) { showError(iInput, iErr, iVal.message); valid = false; }
  else showValid(iInput, iErr);

  if (!rVal.valid) { showError(rInput, rErr, rVal.message); valid = false; }
  else showValid(rInput, rErr);

  if (!valid) {
    showResult('ohm-result', 'error', 'Verifica los campos ingresados', '', '');
    return;
  }

  const result = iVal.value * rVal.value;
  const formatted = formatNumber(result);

  showResult('ohm-result', 'success', formatted, 'V (Voltios)',
    `V = ${iVal.value}A × ${rVal.value}Ω = ${formatted} V`, '🔌');

  addToHistory('Ley de Ohm', `I=${iVal.value}A, R=${rVal.value}Ω`, formatted, 'V');
}

// ---- RESET FORM ----
function resetForm(prefix) {
  const inputs = document.querySelectorAll(`#${prefix} input`);
  inputs.forEach(input => {
    input.value = '';
    clearInputState(input, null);
  });
  document.querySelectorAll(`#${prefix} .error-msg`).forEach(e => e.classList.remove('show'));
  document.querySelectorAll(`#${prefix} .result-box`).forEach(box => {
    box.className = 'result-box';
    box.innerHTML = '';
  });
  document.querySelectorAll(`#${prefix} input`).forEach(i => {
    i.classList.remove('input-error', 'input-valid');
  });
}

// ---- ENTER KEY SUPPORT ----
function initEnterKey() {
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const activeSection = document.querySelector('.calc-section.active');
      if (activeSection) {
        const btn = activeSection.querySelector('.btn-calc');
        if (btn) btn.click();
      }
    }
  });
}

// ---- PARTICLES ANIMATION ----
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const count = Math.min(60, Math.floor(window.innerWidth / 20));

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 0.5,
      color: Math.random() > 0.5 ? '124,58,237' : '37,99,235',
      alpha: Math.random() * 0.5 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Connect nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(124,58,237,${(1 - dist / 100) * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ---- LIVE INPUT VALIDATION ----
function initLiveValidation() {
  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
      if (this.value === '') {
        this.classList.remove('input-error', 'input-valid');
        return;
      }
      const val = parseFloat(this.value);
      if (isNaN(val)) {
        this.classList.add('input-error');
        this.classList.remove('input-valid');
      } else {
        this.classList.add('input-valid');
        this.classList.remove('input-error');
      }
    });
  });
}

// ---- COUNTER ANIMATION ----
function animateCounter(el, target, duration = 1000) {
  const start = parseInt(el.textContent) || 0;
  const range = target - start;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + range * eased);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initEnterKey();
  initParticles();
  initLiveValidation();
  renderHistory();
  updateStats();

  // Default gravity value
  const gInput = document.getElementById('ep-g');
  if (gInput && !gInput.value) gInput.value = '9.81';

  // Animate stat counters
  setTimeout(() => {
    const statCalcs = document.getElementById('stat-calcs');
    if (statCalcs) animateCounter(statCalcs, calcHistory.length, 800);
  }, 500);
});
