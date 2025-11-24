// JS: dibuja la rueda, maneja UI, persistencia y giro robusto
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'ruleta_segments_v1';

  // valores por defecto
  const DEFAULT_SEGMENTS = [
    { label: "Premio A", color: "#ef4444" },
    { label: "Premio B", color: "#f97316" },
    { label: "Premio C", color: "#f59e0b" },
    { label: "Premio D", color: "#10b981" },
    { label: "Premio E", color: "#3b82f6" },
    { label: "Premio F", color: "#8b5cf6" }
  ];

  // DOM
  const canvas = document.getElementById('wheelCanvas');
  const ctx = canvas.getContext('2d');
  const spinBtn = document.getElementById('spinBtn');
  const quickReset = document.getElementById('quickReset');
  const resultText = document.getElementById('resultText');
  const segmentsList = document.getElementById('segments');
  const addBtn = document.getElementById('addBtn');
  const newLabel = document.getElementById('newLabel');
  const newColor = document.getElementById('newColor');
  const jsonData = document.getElementById('jsonData');
  const clearLocalBtn = document.getElementById('clearLocalBtn');
  const centerKnob = document.getElementById('centerKnob');
  const rotor = document.querySelector('.wheel-rotor');

  // state
  let segments = loadSegments();
  let totalRotation = 0; // acumulado absoluto en grados (siempre creciente)
  let spinning = false;

  // HiDPI scaling
  function scaleCanvasForHiDPI() {
    const ratio = window.devicePixelRatio || 1;
    const baseSize = 420;
    canvas.style.width = baseSize + 'px';
    canvas.style.height = baseSize + 'px';
    canvas.width = Math.floor(baseSize * ratio);
    canvas.height = Math.floor(baseSize * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function randomColor(i){
    const palette = ['#ef4444','#f97316','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];
    return palette[i % palette.length];
  }

  // dibuja la ruleta en canvas
  function drawWheel() {
    const cx = parseInt(canvas.style.width) / 2;
    const cy = parseInt(canvas.style.height) / 2;
    const radius = Math.min(cx, cy) - 4;
    const total = Math.max(1, segments.length);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    let startAngle = -Math.PI/2;
    for (let i=0;i<total;i++){
      const seg = segments[i];
      const angle = (2*Math.PI)/total;
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,radius,startAngle,startAngle+angle);
      ctx.closePath();
      ctx.fillStyle = seg.color || randomColor(i);
      ctx.fill();

      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx,cy);
      const midAngle = startAngle + angle/2;
      ctx.rotate(midAngle);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "bold 14px system-ui, -apple-system, 'Segoe UI', Roboto";
      ctx.fillText(seg.label, radius - 12, 6);
      ctx.restore();

      startAngle += angle;
    }
  }

  // UI lista de segmentos
  function populateSegmentList() {
    segmentsList.innerHTML = "";
    segments.forEach((s, idx) => {
      const item = document.createElement('div');
      item.className = 'segment-item';
      item.innerHTML = `
        <div class="swatch" style="background:${s.color}"></div>
        <div style="flex:1;">
          <input data-idx="${idx}" class="editLabel" type="text" value="${escapeHtml(s.label)}" />
        </div>
        <input data-idx="${idx}" class="editColor" type="color" value="${s.color}" />
        <button data-idx="${idx}" class="delBtn" title="Eliminar" style="background:#ef4444;color:#fff;border:none;padding:6px 8px;border-radius:6px;margin-left:8px;">✕</button>
      `;
      segmentsList.appendChild(item);
    });

    segmentsList.querySelectorAll('.editLabel').forEach(input => {
      input.addEventListener('change', (e) => {
        const i = +e.target.dataset.idx;
        segments[i].label = e.target.value || `Opción ${i+1}`;
        saveSegments();
        drawWheel();
        updateJSON();
      });
    });
    segmentsList.querySelectorAll('.editColor').forEach(input => {
      input.addEventListener('change', (e) => {
        const i = +e.target.dataset.idx;
        segments[i].color = e.target.value;
        saveSegments();
        drawWheel();
        updateJSON();
      });
    });
    segmentsList.querySelectorAll('.delBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = +e.target.dataset.idx;
        segments.splice(i,1);
        saveSegments();
        drawWheel();
        populateSegmentList();
        updateJSON();
      });
    });
  }

  function updateJSON(){
    if (jsonData) jsonData.textContent = JSON.stringify(segments, null, 2);
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // persistencia
  function loadSegments(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch(e){}
    return JSON.parse(JSON.stringify(DEFAULT_SEGMENTS));
  }
  function saveSegments(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(segments)); } catch(e){}
  }
  function clearLocal(){
    try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
    segments = JSON.parse(JSON.stringify(DEFAULT_SEGMENTS));
    saveSegments();
    drawWheel();
    populateSegmentList();
    updateJSON();
    if (resultText) resultText.textContent = '—';
  }

  // devuelve el índice actual que está apuntando al puntero (según totalRotation)
  // Nota: simplificamos los offsets y usamos la forma consistente basada en la
  // manera en que la rueda se dibuja (startAngle = -90º).
  function currentLandedIndex(rotationDeg = totalRotation){
    const n = Math.max(1, segments.length);
    const segmentAngle = 360 / n;
    // normalizamos la rotación y calculamos directamente el índice
    const r = ((360 - (rotationDeg % 360)) % 360); // ángulo desde el inicio en sentido horario
    let idx = Math.floor(r / segmentAngle);
    idx = ((idx % n) + n) % n;
    return idx;
  }

  // Opción 1: permitir que el target pueda ser el mismo sector actual,
  // pero garantizar muchas vueltas para que la animación siempre sea evidente.
  function spin() {
    if (spinning || segments.length === 0) return;
    spinning = true;
    spinBtn.disabled = true;

    const n = segments.length;
    const currentIndex = currentLandedIndex();

    // elegir target uniformemente entre 0..n-1 (incluye currentIndex)
    let targetIndex = Math.floor(Math.random()*n);

    const segmentAngle = 360 / n;
    const targetCenterFromTop = -90 + (targetIndex + 0.5) * segmentAngle;
    const normalizedTargetCenter = (targetCenterFromTop % 360 + 360) % 360;

    // aumentar vueltas para evitar giros mínimos (ahora 8..12 vueltas)
    const extraTurns = Math.floor(Math.random()*5) + 8; // 8..12
    const maxOffset = Math.max(0, segmentAngle * 0.15);
    const randomOffset = (Math.random() * (maxOffset*2)) - maxOffset;

    const R_target_base = (360 - normalizedTargetCenter) % 360;
    const finalRotation = totalRotation + extraTurns*360 + R_target_base + randomOffset;
    const duration = 3.8 + extraTurns*0.22; // segundos

    // aseguramos que el elemento rotor exista
    if (!rotor) {
      console.warn('Elemento .wheel-rotor no encontrado: la animación no funcionará correctamente.');
      // fallback: actualizar resultado sin animación
      totalRotation = finalRotation;
      const landed = currentLandedIndex(totalRotation);
      const result = segments[landed];
      if (resultText) resultText.textContent = result ? String(result.label).trim() : "—";
      spinning = false;
      spinBtn.disabled = false;
      return;
    }

    rotor.style.transition = `transform ${duration}s cubic-bezier(.02,.75,.28,1)`;
    // forzar repaint/raf para asegurar transición
    requestAnimationFrame(() => {
      rotor.style.transform = `rotate(${finalRotation}deg)`;
    });

    const onEnd = () => {
      rotor.removeEventListener('transitionend', onEnd);
      totalRotation = finalRotation;
      const landed = currentLandedIndex(totalRotation);
      const result = segments[landed];
      if (resultText) {
        const label = result && result.label ? String(result.label).trim() : '';
        resultText.textContent = label || '—';
      } else {
        console.warn('Elemento #resultText no encontrado para mostrar el resultado.');
      }
      spinning = false;
      spinBtn.disabled = false;
    };

    rotor.addEventListener('transitionend', onEnd, { once: true });
  }

  // eventos UI
  addBtn.addEventListener('click', () => {
    const label = newLabel.value.trim() || `Opción ${segments.length+1}`;
    const color = newColor.value || randomColor(segments.length);
    segments.push({ label, color });
    newLabel.value = '';
    saveSegments();
    drawWheel();
    populateSegmentList();
    updateJSON();
  });

  quickReset.addEventListener('click', () => {
    if (spinning) return;
    totalRotation = 0;
    if (rotor) {
      rotor.style.transition = 'transform 600ms ease';
      rotor.style.transform = 'rotate(0deg)';
    }
    segments = JSON.parse(JSON.stringify(DEFAULT_SEGMENTS));
    saveSegments();
    drawWheel();
    populateSegmentList();
    updateJSON();
    if (resultText) resultText.textContent = '—';
  });

  spinBtn.addEventListener('click', spin);
  centerKnob.addEventListener('click', spin);
  centerKnob.addEventListener('keyup', (e) => { if (e.key === 'Enter' || e.key === ' ') spin(); });
  spinBtn.addEventListener('keyup', (e) => { if (e.key === 'Enter' || e.key === ' ') spin(); });

  clearLocalBtn.addEventListener('click', () => {
    if (!confirm('Borrar las opciones guardadas localmente y restaurar valores por defecto?')) return;
    clearLocal();
  });

  // init
  scaleCanvasForHiDPI();
  drawWheel();
  populateSegmentList();
  updateJSON();
  window.addEventListener('resize', () => {
    scaleCanvasForHiDPI();
    drawWheel();
  });
});