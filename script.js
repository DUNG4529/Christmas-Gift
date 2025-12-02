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
    if (!Array.isArray(items) || items.length === 0) {
      ul.innerHTML = '<li>Hành trình của chúng mình sẽ tiếp tục được viết ✨</li>';
      return;
    }
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
  function initAudio(){
    const cfg = window.GIFT_CONFIG?.audio;
    const bar = $('#music-bar');
    const toggle = $('#music-toggle');
    const vol = $('#music-volume');
    if (!cfg || !cfg.enabled || !bar || !toggle || !vol) return;

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
      audio.addEventListener('play', () => { isPlaying = true; toggle.textContent = '⏸ Tạm dừng'; });
      audio.addEventListener('pause', () => { isPlaying = false; toggle.textContent = '🎵 Phát'; });
      toggle.addEventListener('click', async () => {
        try { if (isPlaying) audio.pause(); else await audio.play(); } catch (_) {}
      });
      vol.addEventListener('input', () => {
        const v = parseFloat(vol.value);
        if (!isNaN(v)) audio.volume = Math.max(0, Math.min(1, v));
      });
      if (cfg.autoplay) audio.play().catch(() => {});
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
      caption.textContent = 'Thêm ảnh vào assets/photos/ và cấu hình trong config.js';
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
    let w, h, flakes;

    function resize(){
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const density = Math.min(200, Math.floor(w * h / 12000));
      flakes = new Array(density).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 2.2,
        s: 0.5 + Math.random() * 1.5,
        a: Math.random() * Math.PI * 2,
      }));
    }

    function step(){
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      flakes.forEach(f => {
        f.y += f.s;
        f.x += Math.cos(f.a) * 0.4;
        f.a += 0.01;
        if (f.y > h + 5) { f.y = -5; f.x = Math.random()*w; }
        if (f.x > w + 5) { f.x = -5; }
        if (f.x < -5) { f.x = w + 5; }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
        ctx.fill();
      });
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

  document.addEventListener('DOMContentLoaded', () => {
    setNamesFromConfig();
    startCountdown();
    renderTimeline();
    smoothAnchors();
    startSnow();
    initAudio();
    initGallery();
  });
})();
