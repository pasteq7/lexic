"use client";
import React, { useEffect, useRef } from 'react';

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      z: number;
      baseSize: number;
      opacity: number;
      targetOpacity: number;
      maxOpacity: number;
      vx: number;
      vy: number;
      vz: number;
      color: string;
      luminosity: number;
      type: 'sharp' | 'soft' | 'glow';
      twinkleSpeed: number;
      fadeInSpeed: number;
      life: number;
      maxLife: number;
      isFadingOut: boolean;

      constructor() {
        if (!canvas) throw new Error('Canvas not initialized');
        
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 1000;
        this.baseSize = Math.random() * 0.4 + 0.15;
        this.opacity = 0; // Start at 0 for fade-in
        this.maxOpacity = Math.random() * 0.6 + 0.4; // Increased from 0.4+0.15 to 0.6+0.4
        this.targetOpacity = this.maxOpacity;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.vz = Math.random() * 0.4 + 0.15;
        
        this.luminosity = Math.random() * 0.7 + 0.3;
        
        const colors = ['#ffffff', '#fefefe', '#f5f5f5', '#e8e8e8', '#f0f0f0'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        const rand = Math.random();
        if (rand < 0.4) {
          this.type = 'sharp';
        } else if (rand < 0.7) {
          this.type = 'soft';
        } else {
          this.type = 'glow';
        }
        
        this.twinkleSpeed = Math.random() * 0.015 + 0.005;
        this.fadeInSpeed = Math.random() * 0.02 + 0.01;
        this.life = 0;
        this.maxLife = Math.random() * 500 + 300;
        this.isFadingOut = false;
      }

      update() {
        if (!canvas) return;
        
        this.x += this.vx;
        this.y += this.vy;
        this.z -= this.vz;
        this.life++;

        // Fade in at the start
        if (this.life < 60 && this.opacity < this.maxOpacity) {
          this.opacity += this.fadeInSpeed;
          if (this.opacity > this.maxOpacity) {
            this.opacity = this.maxOpacity;
          }
        } 
        // Fade out when approaching boundaries or end of life
        else if (this.z < 100 || this.x < 0 || this.x > canvas.width || 
                 this.y < 0 || this.y > canvas.height || this.life > this.maxLife - 60) {
          this.isFadingOut = true;
          this.opacity -= this.fadeInSpeed * 0.8;
          if (this.opacity < 0) this.opacity = 0;
        }
        // Normal twinkling
        else {
          const diff = this.targetOpacity - this.opacity;
          this.opacity += diff * this.twinkleSpeed;
          
          if (Math.abs(diff) < 0.01 && Math.random() < 0.01) {
            this.targetOpacity = Math.random() * 0.3 + (this.maxOpacity * 0.7);
          }
        }

        // Reset particle when fully faded out
        if (this.isFadingOut && this.opacity <= 0) {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.z = 1000;
          this.opacity = 0;
          this.targetOpacity = this.maxOpacity;
          this.life = 0;
          this.isFadingOut = false;
        }
      }

      draw() {
        if (!ctx) return;
        
        const scale = 1000 / (1000 + this.z);
        const size = this.baseSize * scale * 8;
        const finalOpacity = this.opacity * scale; // Removed the * 0.8 that was dimming

        if (size < 0.05 || finalOpacity < 0.005) return;

        ctx.save();
        ctx.globalAlpha = finalOpacity;

        if (this.type === 'sharp') {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.type === 'soft') {
          const blur = scale < 0.5 ? 0.5 : scale * 1.5;
          ctx.filter = `blur(${blur}px)`;
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, size * 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const blur = Math.max(1, scale * 3);
          ctx.filter = `blur(${blur}px)`;
          
          const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size * 2.5);
          gradient.addColorStop(0, this.color);
          gradient.addColorStop(0.4, this.color + 'aa');
          gradient.addColorStop(1, this.color + '00');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(this.x, this.y, size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    const init = () => {
      resize();
      particles = [];
      for (let i = 0; i < 120; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.sort((a, b) => b.z - a.z);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}