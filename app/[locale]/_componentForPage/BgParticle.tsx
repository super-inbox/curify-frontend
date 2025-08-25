"use client";

import { useCallback, useEffect, useRef } from "react";

const NUM_PARTICLES = 100;
const PARTICLE_SIZE = 0.5;
const SPEED = 100000; // Milliseconds

type Particle = {
  x: number;
  y: number;
  diameter: number;
  duration: number;
  amplitude: number;
  offsetY: number;
  arc: number;
  startTime: number;
  color: string;
};

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>(0);

  // 生成正态分布随机数
  const randomNormal = useCallback(
    (options: { mean: number; dev: number; pool?: number[] }) => {
      let { mean = 0, dev = 1, pool = [] } = options;
      if (pool.length > 0) {
        let result;
        let tries = 0;
        do {
          const index = Math.round(randomNormal({ mean, dev }));
          result = pool[index];
          tries++;
        } while ((result === undefined || result < 0) && tries < 100);
        return result ?? mean;
      }

      let u = 0,
        v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      return num * dev + mean;
    },
    []
  );

  const createParticle = useCallback((): Particle => {
    const color = {
      r: randomNormal({ mean: 0, dev: 60 }),
      g: randomNormal({ mean: 64, dev: 0 }),
      b: 248,
      a: Math.random() * 0.5,
    };
    return {
      x: -2,
      y: -2,
      diameter: Math.max(
        0,
        randomNormal({ mean: PARTICLE_SIZE, dev: PARTICLE_SIZE / 2 })
      ),
      duration: randomNormal({ mean: SPEED, dev: SPEED * 0.1 }),
      amplitude: randomNormal({ mean: 16, dev: 2 }),
      offsetY: randomNormal({ mean: 0, dev: 10 }),
      arc: Math.PI * 2,
      startTime: performance.now() - Math.random() * SPEED,
      color: `rgba(${color.r},${color.g},${color.b},${color.a})`,
    };
  }, [randomNormal]);

  const moveParticle = (particle: Particle, time: number): Particle => ({
    ...particle,
    x: ((time - particle.startTime) % particle.duration) / particle.duration,
    y:
      Math.sin(
        (((time - particle.startTime) % particle.duration) /
          particle.duration) *
          particle.arc
      ) *
        particle.amplitude +
      particle.offsetY,
  });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      if (!ctx) return;

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 更新并绘制所有粒子
      const time = performance.now();
      particlesRef.current = particlesRef.current.map((particle) => {
        const moved = moveParticle(particle, time);
        drawParticle(moved, ctx, canvas);
        return moved;
      });

      // 请求下一帧
      animationFrameId.current = requestAnimationFrame(() => draw(ctx, canvas));
    },
    []
  );

  const drawParticle = (
    particle: Particle,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    const vh = canvas.height / 100;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.ellipse(
      particle.x * canvas.width,
      particle.y * vh + canvas.height / 2,
      particle.diameter * vh,
      particle.diameter * vh,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 初始化画布
    const dpr = window.devicePixelRatio;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    const ctx = canvas.getContext("2d");

    // 初始化粒子
    particlesRef.current = Array.from(
      { length: NUM_PARTICLES },
      createParticle
    );

    // 启动动画
    if (ctx) {
      draw(ctx, canvas);
    }

    // 添加窗口大小监听
    window.addEventListener("resize", handleResize);

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [createParticle, draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-screen absolute z-[-1] top-0 left-0 "
    />
  );
}
