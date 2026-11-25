"use client";

import { useEffect, useRef } from "react";
import type { AmbienceScene, ResolvedMotion } from "@/lib/ambience/types";

type WeatherScene = Exclude<AmbienceScene, "none">;

interface Particle {
  x: number;
  y: number;
  size: number;
  vy: number;
  vx: number;
  rotation: number;
  spin: number;
  sway: number;
  swaySpeed: number;
  phase: number;
  alpha: number;
  tone: number;
}

interface Palette {
  petalLight: string;
  petalDeep: string;
  snow: string;
  snowShadow: string;
  rain: string;
}

const TAU = Math.PI * 2;

function readToken(styles: CSSStyleDeclaration, name: string, fallback: string): string {
  const value = styles.getPropertyValue(name).trim();
  return value || fallback;
}

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeParticle(scene: WeatherScene, width: number, height: number): Particle {
  if (scene === "rain") {
    return {
      x: random(-40, width + 40),
      y: random(-height, height),
      size: random(10, 22),
      vy: random(420, 680),
      vx: random(-70, -35),
      rotation: 0,
      spin: 0,
      sway: 0,
      swaySpeed: 0,
      phase: 0,
      alpha: random(0.22, 0.5),
      tone: 0,
    };
  }

  if (scene === "snow") {
    return {
      x: random(0, width),
      y: random(-height, height),
      size: random(1.8, 4.2),
      vy: random(14, 40),
      vx: random(-8, 8),
      rotation: 0,
      spin: 0,
      sway: random(6, 22),
      swaySpeed: random(0.25, 0.7),
      phase: random(0, TAU),
      alpha: random(0.35, 0.85),
      tone: Math.random(),
    };
  }

  return {
    x: random(-30, width + 30),
    y: random(-height, height),
    size: random(5.5, 11),
    vy: random(16, 36),
    vx: random(-14, 14),
    rotation: random(0, TAU),
    spin: random(-0.8, 0.8),
    sway: random(14, 42),
    swaySpeed: random(0.35, 0.9),
    phase: random(0, TAU),
    alpha: random(0.6, 0.98),
    tone: Math.random(),
  };
}

function drawPetal(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  palette: Palette,
  time: number,
) {
  const x = particle.x + Math.sin(time * particle.swaySpeed + particle.phase) * particle.sway;
  const size = particle.size;
  ctx.save();
  ctx.translate(x, particle.y);
  ctx.rotate(particle.rotation);
  ctx.globalAlpha = particle.alpha;
  ctx.fillStyle = particle.tone > 0.55 ? palette.petalDeep : palette.petalLight;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.95, -size * 0.55, size * 0.72, size * 0.72, 0, size);
  ctx.bezierCurveTo(-size * 0.72, size * 0.72, -size * 0.95, -size * 0.55, 0, -size);
  ctx.fill();
  // A lighter inner vein keeps the petals from reading as flat dots.
  ctx.globalAlpha = particle.alpha * 0.5;
  ctx.fillStyle = palette.petalLight;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.1, size * 0.28, size * 0.62, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawSnowflake(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  palette: Palette,
  time: number,
) {
  const x = particle.x + Math.sin(time * particle.swaySpeed + particle.phase) * particle.sway;
  ctx.save();
  ctx.globalAlpha = particle.alpha;
  ctx.fillStyle = palette.snow;
  ctx.shadowColor = palette.snowShadow;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(x, particle.y, particle.size, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawDrizzle(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  palette: Palette,
) {
  ctx.save();
  ctx.globalAlpha = particle.alpha;
  ctx.strokeStyle = palette.rain;
  ctx.lineWidth = 1.1;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(particle.x, particle.y);
  ctx.lineTo(particle.x - particle.size * 0.22, particle.y + particle.size);
  ctx.stroke();
  ctx.restore();
}

export function AmbientParticles({
  scene,
  motion,
  variant = "back",
}: {
  scene: WeatherScene;
  motion: ResolvedMotion;
  variant?: "back" | "edge";
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const styles = getComputedStyle(parent);
    const palette: Palette = {
      petalLight: readToken(styles, "--amb-petal-light", "#ffe3ef"),
      petalDeep: readToken(styles, "--amb-petal-deep", "#ffa8cc"),
      snow: readToken(styles, "--amb-snow", "#ffffff"),
      snowShadow: readToken(styles, "--amb-snow-shadow", "rgba(120, 150, 195, 0.5)"),
      rain: readToken(styles, "--amb-rain", "#9cc3e6"),
    };

    const calm = motion === "calm";
    const base = { sakura: 62, snow: 92, rain: 124 }[scene];
    const variantScale = variant === "edge" ? 1 : 0.8;
    const count = Math.round(base * variantScale * (calm ? 0.5 : 1));
    const speed = calm ? 0.55 : 1;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles: Particle[] = [];
    let frame = 0;
    let last = performance.now();
    let elapsed = 0;
    let visible = !document.hidden;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: count }, () => makeParticle(scene, width, height));
    };

    const step = (now: number) => {
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;
      ctx.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.y += particle.vy * speed * dt;
        particle.x += particle.vx * speed * dt;
        if (scene === "sakura") particle.rotation += particle.spin * speed * dt;

        if (particle.y > height + 30) {
          particle.y = -30;
          particle.x = random(-20, width + 20);
        }
        if (particle.x < -50) particle.x = width + 40;
        if (particle.x > width + 50) particle.x = -40;

        if (scene === "sakura") drawPetal(ctx, particle, palette, elapsed);
        else if (scene === "snow") drawSnowflake(ctx, particle, palette, elapsed);
        else drawDrizzle(ctx, particle, palette);
      }

      frame = requestAnimationFrame(step);
    };

    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) {
        last = performance.now();
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(step);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      ctx.clearRect(0, 0, width, height);
    };
  }, [scene, motion, variant]);

  return (
    <canvas
      ref={canvasRef}
      className={`amb-particles${variant === "edge" ? " amb-particles-edge" : ""}`}
      aria-hidden="true"
    />
  );
}
