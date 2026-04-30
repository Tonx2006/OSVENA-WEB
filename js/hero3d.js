/* ============================================
   OSVENA — Hero 3D Scene (THREE.js + GSAP)
   ============================================ */

(function () {
  /* Safety: make content visible even if libs fail */
  const fallbackTimer = setTimeout(() => {
    const r = document.querySelector('.hero-reveal');
    if (r && parseFloat(getComputedStyle(r).opacity) < 0.5) {
      r.style.transition = 'opacity 1s ease';
      r.style.opacity = '1';
      r.style.filter = 'none';
      r.style.transform = 'none';
    }
  }, 3500);

  if (typeof THREE === 'undefined' || typeof gsap === 'undefined') return;
  clearTimeout(fallbackTimer);

  /* ---- THREE.js canvas ---- */
  function initScene() {
    const heroEl = document.getElementById('hero');
    if (!heroEl) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;display:block;';
    heroEl.insertBefore(canvas, heroEl.firstChild);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 60;

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const spot = new THREE.SpotLight(0xffffff, 3);
    spot.position.set(50, 50, 50);
    scene.add(spot);

    /* Mouse tracking */
    const mouse = new THREE.Vector2(0, 0);
    const mouseLerped = new THREE.Vector2(0, 0);
    window.addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    /* ---- Liquid Background ---- */
    const bgUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) }
    };

    const fovRad = (35 * Math.PI) / 180;
    function getVisibleSize() {
      const h = 2 * Math.tan(fovRad / 2) * 60;
      return { w: h * (window.innerWidth / window.innerHeight), h };
    }
    const vs = getVisibleSize();

    const bgMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        uniforms: bgUniforms,
        vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `
          uniform float uTime;uniform vec2 uMouse;varying vec2 vUv;
          void main(){
            vec2 uv=vUv;float t=uTime*0.15;
            vec2 m=uMouse*0.1;
            float c=smoothstep(0.0,1.0,(sin(uv.x*8.0+t+m.x*12.0)+sin(uv.y*6.0-t+m.y*12.0))*0.5+0.5);
            gl_FragColor=vec4(mix(vec3(0.005),vec3(0.05),c),1.0);
          }
        `
      })
    );
    bgMesh.scale.set(vs.w, vs.h, 1);
    scene.add(bgMesh);

    /* ---- Monolith (Icosahedron) ---- */
    const monoMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(13, 1),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0a0a0a'),
        roughness: 0.05,
        metalness: 1.0
      })
    );
    monoMesh.position.x = 18;
    scene.add(monoMesh);

    /* ---- Animation Loop ---- */
    const clock = new THREE.Clock();
    (function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      bgUniforms.uTime.value = t;
      mouseLerped.lerp(mouse, 0.05);
      bgUniforms.uMouse.value.copy(mouseLerped);
      monoMesh.rotation.y = t * 0.25;
      monoMesh.rotation.x = t * 0.08;
      monoMesh.position.y = Math.sin(t * 2) * 1.5;
      renderer.render(scene, camera);
    })();

    /* Resize */
    window.addEventListener('resize', function () {
      const w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      const s = getVisibleSize();
      bgMesh.scale.set(s.w, s.h, 1);
    });
  }

  /* ---- GSAP Animations ---- */
  function initAnims() {
    const reveal = document.querySelector('.hero-reveal');
    const cta = document.getElementById('heroCta');

    if (reveal) {
      gsap.fromTo(reveal,
        { filter: 'blur(30px)', opacity: 0, scale: 1.02 },
        { filter: 'blur(0px)', opacity: 1, scale: 1, duration: 2.2, ease: 'expo.out' }
      );
    }

    gsap.from('.command-cell', {
      x: 60, opacity: 0, stagger: 0.1, duration: 1.5,
      ease: 'power4.out', delay: 1, clearProps: 'all'
    });

    /* Magnetic CTA */
    if (cta) {
      window.addEventListener('mousemove', function (e) {
        const rect = cta.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        if (dist < 150) {
          gsap.to(cta, {
            x: (e.clientX - cx) * 0.4,
            y: (e.clientY - cy) * 0.4,
            duration: 0.6
          });
        } else {
          gsap.to(cta, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
        }
      });
    }
  }

  initScene();
  initAnims();
})();
