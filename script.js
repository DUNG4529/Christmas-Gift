(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  function setNamesFromConfig(){
    try {
      const cfg = window.GIFT_CONFIG || {};
      const rn = $('#recipient-name');
      const sn = $('#sender-name');
      if (rn && cfg.recipientName) rn.textContent = cfg.recipientName;
      if (sn && cfg.senderName) sn.textContent = cfg.senderName;
    } catch(e) {}
  }

  // Countdown to Christmas (Dec 25)
  function startCountdown(){
    const daysEl = $('#days');
    const hoursEl = $('#hours');
    const minutesEl = $('#minutes');
    const secondsEl = $('#seconds');
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    function getTarget(){
      const now = new Date();
      const year = now.getFullYear();
      const target = new Date(year, 11, 25, 0, 0, 0); // Dec is 11
      if (now > target) {
        return new Date(year + 1, 11, 25, 0, 0, 0);
      }
      return target;
    }
    let target = getTarget();

    function update(){
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        target = getTarget();
      }
      const d = Math.floor(diff / (1000*60*60*24));
      const h = Math.floor((diff / (1000*60*60)) % 24);
      const m = Math.floor((diff / (1000*60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      daysEl.textContent = String(d).padStart(2, '0');
      hoursEl.textContent = String(h).padStart(2, '0');
      minutesEl.textContent = String(m).padStart(2, '0');
      secondsEl.textContent = String(s).padStart(2, '0');
    }
    update();
    setInterval(update, 1000);
  }

  // Render timeline from config
  function renderTimeline(){
    const ul = $('#timeline');
    if (!ul) return;
    const items = (window.GIFT_CONFIG?.timeline) || [];
    if (!Array.isArray(items) || items.length === 0) { ul.innerHTML = ''; return; }
    ul.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `${item.text || ''}${item.date ? `<small>${item.date}</small>` : ''}`;
      ul.appendChild(li);
    });
  }

  // Simple smooth scroll for internal anchors
  // Music: supports YouTube Iframe API or local MP3 fallback
  let audio, musicReady = false, isPlaying = false;
  // Lightweight WebAudio chime for clicks
  let AC, actx;
  function playChime(){
    try {
      AC = AC || window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      actx = actx || new AC();
      if (actx.state === 'suspended') actx.resume();
      const now = actx.currentTime;
      const o1 = actx.createOscillator();
      const g1 = actx.createGain();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(880, now); // A5
      g1.gain.setValueAtTime(0.0001, now);
      g1.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
      g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      o1.connect(g1).connect(actx.destination);
      o1.start(now);
      o1.stop(now + 0.4);
      // second sparkle tone
      const o2 = actx.createOscillator();
      const g2 = actx.createGain();
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(1320, now + 0.02); // E6
      g2.gain.setValueAtTime(0.0001, now + 0.02);
      g2.gain.exponentialRampToValueAtTime(0.12, now + 0.06);
      g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      o2.connect(g2).connect(actx.destination);
      o2.start(now + 0.02);
      o2.stop(now + 0.45);
    } catch(_) {}
  }
  function initAudio(){
    const cfg = window.GIFT_CONFIG?.audio;
    const bar = $('#music-bar');
    const toggle = $('#music-toggle');
    const vol = $('#music-volume');
    if (!cfg || !cfg.enabled || !bar || !vol) return;

    function attachAutoplayUnlock(playFn){
      if (!cfg.autoplay) return;
      const handler = () => { try { playFn && playFn(); } catch(_) {} };
      // Use pointerdown for best compatibility; run once
      window.addEventListener('pointerdown', handler, { once: true });
      window.addEventListener('keydown', handler, { once: true });
    }

    const setupLocal = () => {
      if (!cfg.src) return false;
      audio = new Audio(cfg.src);
      audio.loop = true;
      audio.volume = Math.max(0, Math.min(1, cfg.volume ?? 0.6));
      vol.value = String(audio.volume);
      audio.addEventListener('canplay', () => { musicReady = true; });
      audio.addEventListener('error', () => { musicReady = false; });
      audio.addEventListener('play', () => { isPlaying = true; if (toggle) toggle.textContent = '⏸ Tạm dừng'; });
      audio.addEventListener('pause', () => { isPlaying = false; if (toggle) toggle.textContent = '🎵 Phát'; });
      if (toggle) {
        toggle.addEventListener('click', async () => {
          try { if (isPlaying) audio.pause(); else await audio.play(); } catch (_) {}
        });
      }
      vol.addEventListener('input', () => {
        const v = parseFloat(vol.value);
        if (!isNaN(v)) audio.volume = Math.max(0, Math.min(1, v));
      });
      // Aggressive autoplay: try immediately, retry on visibility changes, and with a short interval.
      if (cfg.autoplay) {
        const tryPlay = () => { audio && audio.play && audio.play().catch(() => {}); };
        tryPlay();
        // Retry a few times in the first seconds
        let retries = 8;
        const iv = setInterval(() => {
          if (isPlaying || --retries <= 0) { clearInterval(iv); return; }
          tryPlay();
        }, 1000);
        // When tab becomes visible again, attempt to play
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && !isPlaying) tryPlay();
        });
      }
      // Also attach unlock in case the browser requires a gesture
      attachAutoplayUnlock(() => audio && audio.play && audio.play());
      return true;
    };

    // Use only local MP3
    setupLocal();
  }

  // Gallery
  function initGallery(){
    const items = window.GIFT_CONFIG?.gallery || [];
    const img = $('#gallery-image');
    const caption = $('#gallery-caption');
    const prev = $('#gallery-prev');
    const next = $('#gallery-next');
    if (!img || !caption || !prev || !next) return;
    if (!Array.isArray(items) || items.length === 0) {
      caption.textContent = '';
      img.style.display = 'none';
      prev.disabled = true; next.disabled = true;
      return;
    }
    let idx = 0;
    function render(){
      const it = items[idx];
      img.src = it.src;
      img.alt = it.caption || 'Kỷ niệm';
      caption.textContent = it.caption || '';
    }
    prev.addEventListener('click', () => { idx = (idx - 1 + items.length) % items.length; render(); });
    next.addEventListener('click', () => { idx = (idx + 1) % items.length; render(); });
    render();
  }

  function smoothAnchors(){
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // Snow animation
  function startSnow(){
    const canvas = document.getElementById('snow-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, flakes, extra = [];
    // Mouse interaction state (smoothed for ultra-smooth feel)
    let mouseX = 0, mouseY = 0, mousePower = 0; // 0..1
    let targetX = 0, targetY = 0;
    const followEase = 0.22; // smoothed cursor follows target (faster follow)
    // Remove global wind so only local avoidance applies
    let influenceRadius = 160; // px (wider, gentler area)
    let maxPush = 9;  // px per frame at peak (softer)
    // Gust/vortex state for prettier "shake" moments
    let gustEnd = 0, gustDuration = 0, gustStrength = 0, gustDir = 0;
    let swirlStrength = 0, vortexX = 0, vortexY = 0, swirlRadius = 320;
    // Gentle breeze that lingers after the shake (soft, directional)
    let breezeEnd = 0, breezeDuration = 0, breezeStrength = 0, breezeDir = 0;
    // Cursor wind puffs (small-scale waves from cursor motion)
    let windPuffs = [];
    // Shake presets (tuning)
    let shakePreset = 'balanced';
    const SHAKE_PRESETS = {
      // Slightly stronger but still smooth via longer duration and radius
      gentle:  { gust: 2.2, swirl: 0.008, duration: 2400, radius: 320, streak: 340 },
      // Default: stronger wind with smooth decay and wider swirl
      balanced:{ gust: 3.6, swirl: 0.013, duration: 3000, radius: 360, streak: 240 },
      // High energy but eased; use if you want more punch
      intense: { gust: 5.0, swirl: 0.020, duration: 3600, radius: 380, streak: 180 },
    };
    let streakDuringGust = SHAKE_PRESETS[shakePreset].streak;

    function resize(){
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      // Increase density and make it scale with screen size more generously
      const density = Math.min(420, Math.floor(w * h / 8000));
      flakes = new Array(density).fill(0).map(() => {
        const r = 0.8 + Math.random() * 2.8; // size
        // Depth factor: smaller flakes are further (move slower, dimmer)
        const depth = Math.max(0.35, Math.min(1, (r / 3.6))); // 0.35..1 roughly
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r,
          s: (0.35 + Math.random() * 1.6) * (0.7 + depth*0.6) + (Math.random() < 0.12 ? Math.random()*1.0 : 0),
          a: Math.random() * Math.PI * 2,
          drift: (0.18 + Math.random() * 0.7) * (0.6 + depth*0.5),
          depth,
        };
      });
    }

    // Foreground streaks for depth accent
    // Lightweight fluid-like flow field (cursor-driven)
    const FLOW = {
      cols: 64,
      rows: 0,
      vx: null, vy: null, vx2: null, vy2: null,
      diffusion: 0.18,
      dissipation: 0.965,
      curl: 0.35,
      scale: 1.35,
      splatRadius: 140, // px
      splatForce: 5.0   // base multiplier
    };

    // Allow external tuning via window.SNOW_TUNING
    (function applySnowTuning(){
      try {
        const T = window.SNOW_TUNING;
        if (!T) return;
        if (T.flow) {
          FLOW.scale = T.flow.scale ?? FLOW.scale;
          FLOW.splatForce = T.flow.splatForce ?? FLOW.splatForce;
          FLOW.splatRadius = T.flow.splatRadius ?? FLOW.splatRadius;
          FLOW.diffusion = T.flow.diffusion ?? FLOW.diffusion;
          FLOW.dissipation = T.flow.dissipation ?? FLOW.dissipation;
          FLOW.curl = T.flow.curl ?? FLOW.curl;
        }
      } catch(_) {}
    })();

    function flowIndex(i,j){ return j*FLOW.cols + i; }
    function flowInit(){
      FLOW.rows = Math.max(12, Math.round(FLOW.cols * h / Math.max(1, w)));
      const n = FLOW.cols * FLOW.rows;
      FLOW.vx = new Float32Array(n);
      FLOW.vy = new Float32Array(n);
      FLOW.vx2 = new Float32Array(n);
      FLOW.vy2 = new Float32Array(n);
    }
    function flowStep(dt){
      const {cols, rows, vx, vy, vx2, vy2, diffusion:df, dissipation:ds, curl:c} = FLOW;
      for (let j=0;j<rows;j++){
        for (let i=0;i<cols;i++){
          const idx = flowIndex(i,j);
          const l = flowIndex(Math.max(0,i-1), j);
          const r = flowIndex(Math.min(cols-1,i+1), j);
          const t = flowIndex(i, Math.max(0,j-1));
          const b = flowIndex(i, Math.min(rows-1,j+1));
          const avgx = (vx[l]+vx[r]+vx[t]+vx[b])*0.25;
          const avgy = (vy[l]+vy[r]+vy[t]+vy[b])*0.25;
          let nx = vx[idx] + (avgx - vx[idx]) * df * dt;
          let ny = vy[idx] + (avgy - vy[idx]) * df * dt;
          // simple curl-ish rotation for a lively swirl
          nx += -c * vy[idx] * 0.1 * dt;
          ny +=  c * vx[idx] * 0.1 * dt;
          nx *= Math.pow(ds, dt);
          ny *= Math.pow(ds, dt);
          vx2[idx] = nx;
          vy2[idx] = ny;
        }
      }
      // swap buffers
      FLOW.vx = vx2.slice(0);
      FLOW.vy = vy2.slice(0);
    }
    function flowSample(px, py){
      // bilinear sample from grid using screen coords
      const gx = (px / Math.max(1,w)) * (FLOW.cols-1);
      const gy = (py / Math.max(1,h)) * (FLOW.rows-1);
      const i0 = Math.max(0, Math.min(FLOW.cols-1, Math.floor(gx)));
      const j0 = Math.max(0, Math.min(FLOW.rows-1, Math.floor(gy)));
      const i1 = Math.min(FLOW.cols-1, i0+1);
      const j1 = Math.min(FLOW.rows-1, j0+1);
      const sx = gx - i0; const sy = gy - j0;
      const i00 = flowIndex(i0,j0), i10 = flowIndex(i1,j0), i01 = flowIndex(i0,j1), i11 = flowIndex(i1,j1);
      const vx = (1-sx)*(1-sy)*FLOW.vx[i00] + sx*(1-sy)*FLOW.vx[i10] + (1-sx)*sy*FLOW.vx[i01] + sx*sy*FLOW.vx[i11];
      const vy = (1-sx)*(1-sy)*FLOW.vy[i00] + sx*(1-sy)*FLOW.vy[i10] + (1-sx)*sy*FLOW.vy[i01] + sx*sy*FLOW.vy[i11];
      return { x: vx, y: vy };
    }
    function flowSplat(px, py, fx, fy){
      const r = FLOW.splatRadius;
      const cols = FLOW.cols, rows = FLOW.rows;
      const cx = Math.max(0, Math.min(cols-1, Math.round((px/Math.max(1,w))*(cols-1))));
      const cy = Math.max(0, Math.min(rows-1, Math.round((py/Math.max(1,h))*(rows-1))));
      const radCellsX = Math.max(1, Math.round((r/Math.max(1,w))*(cols-1)));
      const radCellsY = Math.max(1, Math.round((r/Math.max(1,h))*(rows-1)));
      for (let j = Math.max(0, cy-radCellsY); j <= Math.min(rows-1, cy+radCellsY); j++){
        for (let i = Math.max(0, cx-radCellsX); i <= Math.min(cols-1, cx+radCellsX); i++){
          const idx = flowIndex(i,j);
          const dx = (i - cx) / Math.max(1, radCellsX);
          const dy = (j - cy) / Math.max(1, radCellsY);
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d <= 1){
            const wght = (1 - d);
            FLOW.vx[idx] += fx * wght * FLOW.splatForce * 0.004;
            FLOW.vy[idx] += fy * wght * FLOW.splatForce * 0.004;
          }
        }
      }
    }

    let lastStreak = 0;
    function step(){
      const now = performance.now();
      // compute gust easing factor (0..1)
      let g = 0, sw = 0, br = 0;
      if (now < gustEnd && gustDuration > 0) {
        const t = Math.max(0, (gustEnd - now) / gustDuration); // 0..1
        const ease = t * (2 - t); // ease-out
        g = gustStrength * ease;
        sw = swirlStrength * ease;
      }
      if (now < breezeEnd && breezeDuration > 0) {
        const tb = Math.max(0, (breezeEnd - now) / breezeDuration);
        const eb = tb * (2 - tb); // ease-out
        br = breezeStrength * eb;
      }
      // advance flow field
      const dt = Math.min(3, (now - (step.lastT || now)) / 16.67);
      step.lastT = now;
      flowStep(dt);
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      (flakes.concat(extra)).forEach(f => {
        // base fall
        f.y += f.s;
        // Per-flake drift amplitude for random side-to-side motion
        f.x += Math.cos(f.a) * f.drift;
        // apply sampled flow velocity (depth-aware)
        const fv = flowSample(f.x, f.y);
        f.x += fv.x * FLOW.scale * (0.8 + f.depth*0.8);
        f.y += fv.y * FLOW.scale * (0.7 + f.depth*0.7);
        // apply temporary wind gust (mainly horizontal; slight vertical)
        if (g > 0) {
          f.x += Math.cos(gustDir) * g * (0.6 + f.depth*0.6);
          f.y += Math.sin(gustDir) * g * 0.35;
        }
        // apply lingering gentle breeze (lighter than gust)
        if (br > 0) {
          f.x += Math.cos(breezeDir) * br * (0.5 + f.depth*0.5);
          f.y += Math.sin(breezeDir) * br * 0.2;
        }
        // apply gentle swirl around a temporary vortex
        if (sw > 0) {
          const dxv = f.x - vortexX;
          const dyv = f.y - vortexY;
          const d2 = dxv*dxv + dyv*dyv;
          if (d2 > 1 && d2 < (swirlRadius*swirlRadius)) {
            const d = Math.sqrt(d2);
            // tangent vector (-y, x) for circular motion
            const tnx = -dyv / d;
            const tny =  dxv / d;
            const falloff = 1 - (d / swirlRadius);
            const mag = sw * (0.6 + f.depth*0.6) * falloff;
            f.x += tnx * mag;
            f.y += tny * mag * 0.9;
          }
        }
        // small-scale cursor wind puffs with wave-like wobble
        if (windPuffs.length) {
          let addX = 0, addY = 0;
          for (let i = 0; i < windPuffs.length; i++) {
            const p = windPuffs[i];
            const dxp = f.x - p.x;
            const dyp = f.y - p.y;
            const d2p = dxp*dxp + dyp*dyp;
            const r = p.r;
            if (d2p > 1 && d2p < r*r) {
              const d = Math.sqrt(d2p);
              const fall = 1 - (d / r);
              const fall2 = fall * fall; // smoother edge
              // main push along puff velocity
              addX += p.vx * 0.5 * fall2 * (0.6 + f.depth*0.5);
              addY += p.vy * 0.5 * fall2 * (0.5 + f.depth*0.4);
              // subtle perpendicular wave for ripples
              const tnx = -dyp / d;
              const tny =  dxp / d;
              const wobble = Math.sin((now*0.012) + (d*0.06));
              const amp = 0.8 * fall * wobble;
              addX += tnx * amp;
              addY += tny * amp * 0.7;
            }
          }
          // cap to avoid overshoot
          if (addX > 4) addX = 4; else if (addX < -4) addX = -4;
          if (addY > 3) addY = 3; else if (addY < -3) addY = -3;
          f.x += addX;
          f.y += addY;
        }
        // move smoothed cursor toward target for nicer flow
        mouseX += (targetX - mouseX) * followEase;
        mouseY += (targetY - mouseY) * followEase;
        // mouse repulsion (soft)
        if (mousePower > 0) {
          const dx = f.x - mouseX;
          const dy = f.y - mouseY;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < influenceRadius) {
            const t = 1 - (dist / influenceRadius); // 0..1
            const eased = t * (2 - t); // quadratic ease-out to reduce jerk
            const push = maxPush * mousePower * eased;
            // normalize away from cursor
            f.x += (dx / dist) * push;
            f.y += (dy / dist) * push * 0.5; // a bit less vertical to keep falling feel
          }
        }
        // vary angular speed slightly for each flake
        f.a += 0.006 + (f.r * 0.002) + (Math.random()*0.002);
        if (f.y > h + 5) { f.y = -5; f.x = Math.random()*w; }
        if (f.x > w + 5) { f.x = -5; }
        if (f.x < -5) { f.x = w + 5; }
        ctx.beginPath();
        ctx.globalAlpha = 0.65 + f.depth*0.35; // further flakes slightly dimmer
        ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      // Occasionally draw a fast foreground flake/streak
      if (now - lastStreak > (g > 0 ? streakDuringGust : 650)) {
        lastStreak = now;
        const sx = Math.random() * w;
        const sy = -10;
        const len = 10 + Math.random()*18;
        const drift = (Math.random()*0.8 - 0.4);
        // Draw as a short line for motion blur effect
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + drift*len, sy + len);
        ctx.stroke();
        ctx.restore();
      }
      // decay mouse power smoothly
      mousePower = Math.max(0, mousePower - 0.015);
      // drop expired wind puffs
      if (windPuffs.length) {
        windPuffs = windPuffs.filter(p => p.end > now);
      }
      requestAnimationFrame(step);
    }

    resize();
    flowInit();
    step();
    window.addEventListener('resize', () => { resize(); flowInit(); });

    // Pointer moves increase mousePower and update position
    let lastPX = null, lastPY = null, lastTS = 0;
    const onMove = (e) => {
      const ts = performance.now();
      const px = e.clientX, py = e.clientY;
      targetX = px; targetY = py;
      mousePower = Math.min(1, mousePower + 0.25);
      // create a small wind puff based on movement delta (compute BEFORE updating last point)
      if (lastPX != null && lastPY != null) {
        const prevX = lastPX, prevY = lastPY;
        const dx = px - prevX;
        const dy = py - prevY;
        const speed = Math.hypot(dx, dy);
        if (speed > 0.5) {
          const now = ts;
          const maxPuffs = 8;
          const PC = (window.SNOW_TUNING && window.SNOW_TUNING.puff?.coef) ?? 0.26;
          const PRB = (window.SNOW_TUNING && window.SNOW_TUNING.puff?.radiusBoost) ?? 60;
          const PL = (window.SNOW_TUNING && window.SNOW_TUNING.puff?.life) ?? 1200;
          const P = {
            x: px,
            y: py,
            vx: dx * PC,
            vy: dy * PC,
            r: 160 + PRB + Math.min(220, speed * 2),
            end: now + PL
          };
          windPuffs.push(P);
          if (windPuffs.length > maxPuffs) windPuffs.shift();
          // add a splat to the flow field so motion persists
          flowSplat(px, py, dx, dy);
        }
      }
      // update last point AFTER computing delta
      lastPX = px; lastPY = py; lastTS = ts;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    // Reduce influence when pointer leaves window
    window.addEventListener('pointerleave', () => { mousePower = 0; });

    // Boost snow density temporarily with more random sizes/speeds
    window.boostSnow = function(){
      const count = 260;
      const add = new Array(count).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * -h * Math.random(),
        r: 0.8 + Math.random() * 3.2,
        s: 0.8 + Math.random() * 3.2,
        a: Math.random() * Math.PI * 2,
        drift: 0.2 + Math.random() * 0.9,
      }));
      extra = extra.concat(add);
      setTimeout(() => { extra.splice(0, add.length); }, 5000);
      // trigger a brief gust + swirl for a prettier shake (using preset)
      const now2 = performance.now();
      const P = SHAKE_PRESETS[shakePreset] || SHAKE_PRESETS.balanced;
      gustDuration = P.duration;
      gustStrength = P.gust; // px/frame scale
      gustDir = Math.random() * Math.PI * 2;
      swirlStrength = P.swirl; // tangential velocity factor
      swirlRadius = P.radius;
      streakDuringGust = P.streak;
      vortexX = Math.random() * w;
      vortexY = h * (0.25 + Math.random()*0.5);
      gustEnd = now2 + gustDuration;
      // add a soft, longer breeze that follows the gust
      const BF = (window.SNOW_TUNING && window.SNOW_TUNING.breeze?.factor) ?? 0.35;
      const BXD = (window.SNOW_TUNING && window.SNOW_TUNING.breeze?.extraDuration) ?? 2000;
      breezeDuration = Math.max(4200, P.duration + BXD);
      breezeStrength = Math.max(0.6, P.gust * BF);
      breezeDir = gustDir + (Math.random()*0.6 - 0.3); // near gust direction
      breezeEnd = now2 + breezeDuration;
      // a couple sparkle bursts to accent the shake
      try {
        const cx = w * 0.5, cy = h * 0.35;
        spawnSparkles(cx, cy);
        setTimeout(() => spawnSparkles(cx + 80, cy + 40), 220);
      } catch(_) {}
    }

    // Expose a tiny API to tune the shake intensity at runtime
    window.setSnowShakePreset = function(preset){
      if (preset && SHAKE_PRESETS[preset]) {
        shakePreset = preset;
        streakDuringGust = SHAKE_PRESETS[preset].streak;
      }
    }
  }

  // Starfield background
  function startStars(){
    const canvas = document.getElementById('star-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, stars;

    function resize(){
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(180, Math.floor((w*h)/18000));
      stars = new Array(count).fill(0).map(() => ({
        x: Math.random()*w,
        y: Math.random()*h,
        r: Math.random()*1.5 + 0.4,
        a: Math.random()*Math.PI*2,
        s: Math.random()*0.005 + 0.002,
      }));
    }

    function step(){
      ctx.clearRect(0,0,w,h);
      for (const st of stars){
        st.a += st.s;
        const tw = (Math.sin(st.a)*0.5 + 0.5); // 0..1
        ctx.globalAlpha = 0.5 + tw*0.5;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(step);
    }
    resize();
    step();
    window.addEventListener('resize', resize);
  }

  // Hearts confetti for gift page
  window.startHeartConfetti = function(){
    const container = document.getElementById('hearts-container');
    if (!container) return;
    const count = 50;
    const maxX = window.innerWidth;
    const maxY = window.innerHeight;

    for (let i=0; i<count; i++) {
      const span = document.createElement('span');
      span.className = 'heart';
      span.textContent = ['💖','❤️','💘','💝'][Math.floor(Math.random()*4)];
      span.style.left = Math.random() * maxX + 'px';
      span.style.top = (maxY + 40) + 'px';
      span.style.animationDelay = (Math.random()*1.5).toFixed(2) + 's';
      span.style.fontSize = (16 + Math.random()*16) + 'px';
      container.appendChild(span);
      setTimeout(() => span.remove(), 4000);
    }
  }

  function spawnSparkles(x, y){
    const n = 14; const icons = ['❄️','✨','⭐'];
    for (let i=0;i<n;i++){
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.textContent = icons[Math.floor(Math.random()*icons.length)];
      const dx = (Math.random()*160 - 80) + 'px';
      const dy = (Math.random()*-160) + 'px';
      s.style.setProperty('--dx', dx);
      s.style.setProperty('--dy', dy);
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      document.body.appendChild(s);
      setTimeout(()=> s.remove(), 900);
    }
  }

  // Lightweight cursor trail inside festive section
  function setupCursorTrail(){
    const zone = document.getElementById('festive');
    if (!zone) return;
    let last = 0;
    zone.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - last < 90) return; // throttle ~11fps
      last = now;
      const x = e.clientX, y = e.clientY;
      const n = 4; const icons = ['❄️','✨'];
      for (let i=0;i<n;i++){
        const s = document.createElement('span');
        s.className = 'sparkle';
        s.textContent = icons[Math.floor(Math.random()*icons.length)];
        const dx = (Math.random()*40 - 20) + 'px';
        const dy = (Math.random()*-60) + 'px';
        s.style.setProperty('--dx', dx);
        s.style.setProperty('--dy', dy);
        s.style.left = (x + (Math.random()*10-5)) + 'px';
        s.style.top = (y + (Math.random()*10-5)) + 'px';
        document.body.appendChild(s);
        setTimeout(()=> s.remove(), 800);
      }
    });
  }

  // Subtle parallax tilt for hero title based on mouse position
  function setupHeroParallax(){
    const hero = document.querySelector('.hero');
    const title = hero && hero.querySelector('h1');
    if (!hero || !title) return;
    let last = 0;
    const onMove = (e) => {
      const now = performance.now();
      if (now - last < 50) return; // ~20fps
      last = now;
      const rect = hero.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const dx = (e.clientX - cx) / rect.width;  // -0.5..0.5
      const dy = (e.clientY - cy) / rect.height; // -0.5..0.5
      const rx = Math.max(-6, Math.min(6, dy * -12));
      const ry = Math.max(-6, Math.min(6, dx * 12));
      title.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    const reset = () => { title.style.transform = 'none'; };
    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', reset);
  }

  function showToast(text){
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(()=> t.remove(), 2200);
  }

  // Paper confetti burst (no CSS dependency; uses WAAPI)
  function burstConfetti(x, y){
    const colors = ['#ff595e','#ffca3a','#8ac926','#1982c4','#6a4c93','#ffd166','#ef476f'];
    const n = 60;
    for (let i=0;i<n;i++){
      const el = document.createElement('div');
      const size = 6 + Math.random()*6;
      el.style.position = 'fixed';
      el.style.left = (x - size/2) + 'px';
      el.style.top = (y - size/2) + 'px';
      el.style.width = size + 'px';
      el.style.height = (size*0.6) + 'px';
      el.style.background = colors[i % colors.length];
      el.style.transform = `rotate(${Math.random()*360}deg)`;
      el.style.zIndex = 4;
      el.style.pointerEvents = 'none';
      document.body.appendChild(el);
      const angle = Math.random()*Math.PI*2;
      const speed = 100 + Math.random()*260;
      const dx = Math.cos(angle)*speed;
      const dy = Math.sin(angle)*speed - 80; // initial up
      const dura = 900 + Math.random()*600;
      const anim = el.animate([
        { transform: `translate(0,0) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${Math.random()*720-360}deg)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy+400+Math.random()*200}px) rotate(${Math.random()*1440-720}deg)`, opacity: 0 }
      ], { duration: dura, easing: 'cubic-bezier(.2,.6,.2,1)' });
      anim.onfinish = () => el.remove();
    }
  }

  // Fireworks now handled by firework/script_firesork.js overlay
  function startFireworks(ms=5000){
    if (window.FireworkOverlay && typeof window.FireworkOverlay.start === 'function') {
      window.FireworkOverlay.start(ms);
    }
  }
  function stopFireworks(){
    if (window.FireworkOverlay && typeof window.FireworkOverlay.stop === 'function') {
      window.FireworkOverlay.stop();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setNamesFromConfig();
    startCountdown();
    renderTimeline();
    smoothAnchors();
    startSnow();
    startStars();
    initAudio();
    initGallery();
    setupCursorTrail();
    setupHeroParallax();

    // Santa fly-by
    const santa = document.getElementById('santa');
    if (santa) {
      const fly = () => { santa.classList.remove('fly'); void santa.offsetWidth; santa.classList.add('fly'); };
      setTimeout(fly, 1200);
      setInterval(fly, 16000);
    }

    // Ornaments click/hover: sparkles + toast + chime
    const msgs = (window.GIFT_CONFIG && window.GIFT_CONFIG.ornamentMessages) || [];
    const ornaments = document.querySelectorAll('.ornament');
    ornaments.forEach(o => {
      o.addEventListener('click', (e) => {
        const rect = o.getBoundingClientRect();
        const x = rect.left + rect.width/2; const y = rect.top + rect.height/2;
        spawnSparkles(x, y);
        playChime();
        if (msgs.length) showToast(msgs[Math.floor(Math.random()*msgs.length)]);
      });
      o.addEventListener('mouseenter', (e) => {
        const rect = o.getBoundingClientRect();
        const x = rect.left + rect.width/2; const y = rect.top + rect.height/2;
        spawnSparkles(x, y);
      });
    });

    const shakeBtn = document.getElementById('shake-snow');
    if (shakeBtn) shakeBtn.addEventListener('click', () => { window.boostSnow && window.boostSnow(); });
    const shakeBtnGift = document.getElementById('shake-snow-gift');
    if (shakeBtnGift) shakeBtnGift.addEventListener('click', () => { window.boostSnow && window.boostSnow(); });
    // Fireworks sound effect
    function playFireworksSound(){
      try {
        const s = new Audio('assets/audio/fireworks-29629.mp3');
        s.volume = 0.6; // comfortable level
        // return audio so we can sync duration
        s.play().catch(()=>{});
        return s;
      } catch(_) { return null; }
    }
    // helper: smooth page fade for scene transitions
    function fadePage(duration=1360){
      try {
        document.body.classList.add('page-fade');
        setTimeout(() => { document.body.classList.remove('page-fade'); }, duration + 40);
      } catch(_) {}
    }

    // helper: quick fade-in lift at fireworks start
    function fadeInStart(duration=240){
      try {
        const b = document.body;
        b.classList.add('page-fade-in');
        b.style.opacity = '0';
        // force reflow to ensure transition applies
        void b.offsetWidth;
        b.style.opacity = '1';
        setTimeout(() => { b.style.opacity = ''; b.classList.remove('page-fade-in'); }, duration + 40);
      } catch(_) {}
    }

    const fwBtn = document.getElementById('fireworks');
    const fwBtnGift = document.getElementById('fireworks-gift');
    const bindFireworks = (btn) => btn && btn.addEventListener('click', () => {
      // start with a subtle page fade-in lift
      fadeInStart(240);
      const audio = playFireworksSound();
      // Start overlay immediately without fixed duration; stop exactly on audio 'ended'
      if (window.FireworkOverlay && typeof window.FireworkOverlay.start === 'function') {
        window.FireworkOverlay.start();
      } else {
        startFireworks();
      }
      if (audio) {
        audio.addEventListener('ended', () => {
          // Fade the scene as fireworks wind down
          fadePage(1360);
          if (window.FireworkOverlay && typeof window.FireworkOverlay.stop === 'function') {
            window.FireworkOverlay.stop();
          } else {
            stopFireworks();
          }
        });
      }
    });
    bindFireworks(fwBtn);
    bindFireworks(fwBtnGift);

    // CSS 3D gift box: click to open + confetti
    const giftBox = document.querySelector('.gift-box');
    if (giftBox) {
      giftBox.addEventListener('click', (e) => {
        giftBox.classList.toggle('open');
        const rect = giftBox.getBoundingClientRect();
        const cx = rect.left + rect.width/2;
        const cy = rect.top + rect.height*0.2; // burst from near the top
        burstConfetti(cx, cy);
        playChime();
      });
    }
  });
})();
