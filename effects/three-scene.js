(function(){
  const cfg = (window.GIFT_CONFIG && window.GIFT_CONFIG.three) || {};
  const enabled = cfg.enabled !== false; // default true
  if (!enabled) return;

  function loadThree(cb){
    if (window.THREE) return cb();
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/three@0.159.0/build/three.min.js';
    s.onload = cb;
    s.onerror = () => console.warn('Không tải được THREE.js, bỏ qua hiệu ứng 3D');
    document.head.appendChild(s);
  }

  function init(){
    const host = document.getElementById('three-stage');
    if (!host) return;

    const lowPower = !!cfg.lowPower;
    const snowCount = Math.max(0, Math.min(1200, cfg.snowCount ?? (lowPower ? 150 : 350)));
    const color = cfg.ornamentColor || 0xff4d6d;

    const renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: true });
    const DPR = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 2);
    renderer.setPixelRatio(DPR);
    host.innerHTML = '';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.6, 2.2);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x224466, 0.8);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(2, 2, 2);
    scene.add(dir);

    // Ornament (sphere)
    const sphereGeo = new THREE.SphereGeometry(0.35, lowPower ? 16 : 32, lowPower ? 12 : 24);
    const sphereMat = new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.3, envMapIntensity: 1.0 });
    const ornament = new THREE.Mesh(sphereGeo, sphereMat);
    ornament.position.y = 0.2;
    scene.add(ornament);

    // Hook (torus)
    const torusGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 24);
    const hook = new THREE.Mesh(torusGeo, new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.8, roughness: 0.2 }));
    hook.rotation.x = Math.PI / 2;
    hook.position.y = 0.58;
    scene.add(hook);

    // String
    const strGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.25, 8);
    const str = new THREE.Mesh(strGeo, new THREE.MeshStandardMaterial({ color: 0xffd166 }));
    str.position.y = 0.8;
    scene.add(str);

    // Snow particles using a generated sprite
    const sprite = (() => {
      const size = 64; const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      const grd = g.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      grd.addColorStop(0, 'rgba(255,255,255,1)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd; g.beginPath(); g.arc(size/2, size/2, size/2, 0, Math.PI*2); g.fill();
      const tex = new THREE.CanvasTexture(c); tex.premultiplyAlpha = true; return tex;
    })();

    const positions = new Float32Array(snowCount * 3);
    const sizes = new Float32Array(snowCount);
    for (let i=0;i<snowCount;i++){
      positions[i*3+0] = (Math.random()-0.5) * 6;
      positions[i*3+1] = Math.random() * 4; // height
      positions[i*3+2] = (Math.random()-0.5) * 6;
      sizes[i] = Math.random()*0.02 + 0.006;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ size: lowPower ? 8 : 10, map: sprite, transparent: true, depthWrite: false });
    const snow = new THREE.Points(geo, mat);
    scene.add(snow);

    function resize(){
      const w = host.clientWidth || 300; const h = host.clientHeight || 260;
      renderer.setSize(w, h, false); camera.aspect = w/h; camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    let running = true; let t = 0;
    function animate(){
      if (!running) return;
      requestAnimationFrame(animate);
      t += 0.01;
      ornament.rotation.y += 0.01;
      ornament.position.x = Math.sin(t*0.6) * 0.05;
      const pos = snow.geometry.attributes.position;
      for (let i=0; i<pos.count; i++){
        let y = pos.getY(i) - (lowPower ? 0.008 : 0.012);
        if (y < -0.2) y = 4 + Math.random()*0.5;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();

    // Controls
    const toggleBtn = document.getElementById('toggle-3d');
    const reduceBtn = document.getElementById('reduce-3d');
    toggleBtn && toggleBtn.addEventListener('click', () => {
      running = !running;
      if (running) animate();
    });
    reduceBtn && reduceBtn.addEventListener('click', () => {
      alert('Chế độ nhẹ máy: hãy tắt/bật lại trang nếu muốn áp dụng cấu hình thấp hơn trong file config.three.lowPower = true');
    });
  }

  loadThree(init);
})();
