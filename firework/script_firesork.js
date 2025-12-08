// Overlay Firework module (no global onload; start/stop on demand)
window.FireworkOverlay = (function(){
  let canvas, context, width, height;
  let clicked = false;
  let mouseX = 0, mouseY = 0;
  let particles = [];
  let windDown = false; // graceful end phase flag
  const particleSettings = { gravity: 0.05 };


  // No mouse/touch dependency; controlled by start/stop

//For using request animationFrame on all browsers
  window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };

//Function on window load
  function mountCanvas(){
    width = window.innerWidth;
    height = window.innerHeight;
    canvas = document.createElement('canvas');
    canvas.id = 'fw-overlay-canvas';
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.zIndex = '20';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);
    context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });
  }

// Overlay runs via start()/stop(); no global pointer bindings

//Function to generate random number between a given range
  function randomNumberGenerator(min, max) {
  return Math.random() * (max - min) + min;
  }

  function Particle() {
  this.width = randomNumberGenerator(0.1, 0.9) * 5;
  this.height = randomNumberGenerator(0.1, 0.9) * 5;
  this.x = mouseX - this.width / 2;
  this.y = mouseY - this.height / 2;

  //Velocity of the particle
  this.vx = (Math.random() - 0.5) * 10;
  this.vy = (Math.random() - 0.5) * 10;
  this.alpha = 1; // per-particle opacity for wind-down fade
  }

  Particle.prototype = {
  move: function () {
    if (this.x >= canvas.width || this.y >= canvas.height) {
      return false;
    }
    return true;
  },
  draw: function () {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += particleSettings.gravity;
    context.save();
    context.beginPath();
    context.translate(this.x, this.y);
    context.arc(0, 0, this.width, 0, Math.PI * 2);
    context.fillStyle = this.color;
    if (windDown) {
      // decay alpha and slow velocities gently
      this.alpha = Math.max(0, this.alpha - 0.02);
      this.vx *= 0.985;
      this.vy *= 0.985;
      context.globalAlpha = this.alpha;
    }
    context.closePath();
    context.fill();
    context.restore();
  },
  };

  function createFirework() {
  //Increase range for bigger fireworks
  var numberOfParticles = randomNumberGenerator(40, 90);
  let color = `rgb(${randomNumberGenerator(0, 255)},${randomNumberGenerator(
    0,
    255
  )},${randomNumberGenerator(0, 255)})`;

  for (var i = 0; i < numberOfParticles; i++) {
    var particle = new Particle();
    particle.color = color;
    var vy = Math.sqrt(25 - particle.vx * particle.vx);
    if (Math.abs(particle.vy) > vy) {
      particle.vy = particle.vy > 0 ? vy : -vy;
    }
    particles.push(particle);
  }
  }

//Function that begins the firework
  let spawnInterval = 0;
    let running = false;
    function startFireWork() {
  let current = [];
  //Control trail left by particles through the value of alpha
  // Stronger trail during wind-down for lingering glow
  context.fillStyle = windDown ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.03)";
  context.fillRect(0, 0, width, height);
  // generation handled by interval when active
  for (let i in particles) {
    particles[i].draw();
    if (particles[i].move()) {
      // drop fully faded particles during wind-down
      if (!windDown || particles[i].alpha > 0.02) current.push(particles[i]);
    }
  }
  particles = current;
  if (running || windDown) {
    window.requestAnimationFrame(startFireWork);
  }
  }

  function start(durationMs){
    if (!canvas) { mountCanvas(); }
    particles.length = 0; clicked = true;
      running = true;
      windDown = false;
    // initial burst at center for feedback
    mouseX = width/2; mouseY = height*0.4; createFirework();
    // add a couple extra bursts for visibility
    mouseX = width*0.3; mouseY = height*0.5; createFirework();
    mouseX = width*0.7; mouseY = height*0.35; createFirework();
    // visual hint
    try {
      const hint = document.createElement('div');
      hint.textContent = '🎆 Pháo hoa đang chạy (ESC để tắt)';
      hint.style.position = 'fixed';
      hint.style.left = '50%';
      hint.style.top = '16px';
      hint.style.transform = 'translateX(-50%)';
      hint.style.zIndex = '7';
      hint.style.padding = '8px 12px';
      hint.style.borderRadius = '10px';
      hint.style.background = 'rgba(11,26,43,0.75)';
      hint.style.color = '#fff';
      hint.style.border = '1px solid rgba(255,255,255,0.15)';
      document.body.appendChild(hint);
      setTimeout(() => hint.remove(), 2000);
    } catch(_) {}
    // spawn fireworks periodically while active
    if (spawnInterval) { clearInterval(spawnInterval); }
    spawnInterval = setInterval(() => {
      if (!clicked) return; // paused/stopped
      mouseX = Math.random() * width;
      mouseY = Math.random() * height * 0.8;
      createFirework();
    }, 140);
    // allow ESC to close
    const escHandler = (e) => { if (e.key === 'Escape') { stop(); document.removeEventListener('keydown', escHandler); } };
    document.addEventListener('keydown', escHandler);
    // auto stop after duration
    if (typeof durationMs === 'number' && durationMs > 0) {
      setTimeout(() => { stop(); document.removeEventListener('keydown', escHandler); }, durationMs);
    }
    // kick off RAF once
    if (running || windDown) window.requestAnimationFrame(startFireWork);
  }
  function stop(){
    try {
      clicked = false;
        running = false;
        windDown = true; // enter graceful wind-down phase
      if (spawnInterval) { clearInterval(spawnInterval); spawnInterval = 0; }
      // allow ~800ms for particles to fade and slow
      setTimeout(() => {
        windDown = false;
        if (canvas) {
          try {
            canvas.style.transition = 'opacity 360ms ease-in-out';
            canvas.style.opacity = '0';
            setTimeout(() => { if (canvas) { canvas.remove(); canvas = null; } }, 400);
          } catch(_) { canvas.remove(); canvas = null; }
        }
        particles.length = 0;
      }, 800);
    } catch(_) {}
  }

  return { start, stop };
})();