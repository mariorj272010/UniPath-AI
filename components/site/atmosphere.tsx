"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  z: number; // depth 0..1 for parallax + size
  r: number;
  vx: number;
  vy: number;
  hue: number; // 0 = ember, 1 = halo
  tw: number; // twinkle phase
};

/**
 * Ambient particle + volumetric fog field. Pure Canvas2D, no deps.
 * Drifts slowly, parallaxes to the pointer, and dims itself when the
 * tab is hidden or the user prefers reduced motion.
 */
export function Atmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let raf = 0;
    let running = true;

    const seed = () => {
      const density = Math.min(window.innerWidth * window.innerHeight / 14000, 130);
      particles = Array.from({ length: Math.floor(density) }, () => {
        const z = Math.random();
        return {
          x: Math.random(),
          y: Math.random(),
          z,
          r: 0.4 + z * 1.9,
          vx: (Math.random() - 0.5) * 0.00006,
          vy: -0.00004 - Math.random() * 0.00012,
          hue: Math.random() < 0.7 ? 0 : 1,
          tw: Math.random() * Math.PI * 2,
        };
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const ember = [255, 196, 120];
    const halo = [150, 210, 240];

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      const px = (pointer.x - 0.5) * 2;
      const py = (pointer.y - 0.5) * 2;
      const t = performance.now() * 0.001;

      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -0.05) p.y = 1.05;
          if (p.x < -0.05) p.x = 1.05;
          if (p.x > 1.05) p.x = -0.05;
        }
        const par = 26 * p.z; // deeper = more parallax shift
        const sx = p.x * w - px * par;
        const sy = p.y * h - py * par;
        const twinkle = reduce ? 0.8 : 0.55 + Math.sin(t * 1.4 + p.tw) * 0.45;
        const [cr, cg, cb] = p.hue === 0 ? ember : halo;
        const alpha = (0.05 + p.z * 0.32) * twinkle;
        const rad = p.r * (1 + p.z);
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad * 4);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, rad * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      if (running && !reduce) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      pointer.tx = e.clientX / window.innerWidth;
      pointer.ty = e.clientY / window.innerHeight;
    };
    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running && !reduce) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    draw(); // paints at least one frame even under reduced motion
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Volumetric fog wells */}
      <div className="anim-aurora absolute -left-[10%] top-[-15%] h-[70vh] w-[70vw] rounded-full opacity-70 blur-[120px]"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.13 56 / 0.35), transparent 65%)" }} />
      <div className="anim-aurora absolute right-[-15%] top-[30%] h-[60vh] w-[60vw] rounded-full opacity-50 blur-[130px]"
        style={{ background: "radial-gradient(circle, oklch(0.5 0.08 220 / 0.3), transparent 60%)", animationDelay: "-8s" }} />

      {/* Light rays raking down from the top-right key light */}
      <div className="absolute inset-0 origin-top opacity-60 mask-fade-b">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="anim-ray absolute top-[-20%] block h-[120vh] w-[34vw] blur-2xl"
            style={
              {
                right: `${4 + i * 16}%`,
                "--ray-rot": `${10 + i * 3}deg`,
                animationDelay: `${-i * 2.2}s`,
                background:
                  "linear-gradient(to bottom, oklch(0.86 0.13 78 / 0.16), transparent 70%)",
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Vignette to seat everything in the void */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 40%, transparent 55%, oklch(0.09 0.01 58 / 0.85) 100%)",
        }}
      />
    </div>
  );
}
