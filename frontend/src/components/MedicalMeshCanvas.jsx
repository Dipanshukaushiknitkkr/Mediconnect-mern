import React, { useEffect, useRef } from 'react';

/**
 * MedicalMeshCanvas
 * High-performance lightweight 3D perspective particle and wave lattice canvas.
 * Simulates real-time digital bio-telemetry waves with cursor interactivity.
 * Zero external 3D asset overhead (<5KB vanilla canvas).
 */
export default function MedicalMeshCanvas({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
      if (prefersReducedMotion) {
        drawFrame(0.5);
      }
    };

    const handleMouseMove = (e) => {
      if (prefersReducedMotion) return;
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    window.addEventListener('resize', handleResize);
    canvas.parentElement.addEventListener('mousemove', handleMouseMove);

    // Grid nodes configuration
    const cols = 22;
    const rows = 12;
    let step = 0;

    const drawFrame = (currentStep) => {
      ctx.clearRect(0, 0, width, height);

      const cellW = width / (cols - 1);
      const cellH = height / (rows - 1);
      const points = [];

      // Calculate 3D-elevated undulating mesh points
      for (let r = 0; r < rows; r++) {
        points[r] = [];
        for (let c = 0; c < cols; c++) {
          const x = c * cellW;
          const y = r * cellH;

          // Distance to interactive mouse
          const dx = x - mouseX;
          const dy = y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const mouseEffect = Math.max(0, 1 - dist / 220) * 35;

          // Harmonic bio-wave equation
          const wave = Math.sin(c * 0.35 + currentStep) * Math.cos(r * 0.45 + currentStep * 0.8) * 16;
          const elevation = wave - mouseEffect;

          points[r][c] = {
            x: x + (dx / 30),
            y: y + elevation
          };
        }
      }

      // Draw lattice connections
      ctx.lineWidth = 1;

      // Horizontal lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const pt = points[r][c];
          if (c === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        const alpha = (r / rows) * 0.22 + 0.05;
        ctx.strokeStyle = `rgba(2, 132, 199, ${alpha})`;
        ctx.stroke();
      }

      // Vertical lines
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const pt = points[r][c];
          if (r === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        const alpha = 0.12;
        ctx.strokeStyle = `rgba(5, 150, 105, ${alpha})`;
        ctx.stroke();
      }

      // Render glowing pulse telemetry points
      for (let r = 1; r < rows - 1; r += 2) {
        for (let c = 1; c < cols - 1; c += 2) {
          const pt = points[r][c];
          const pulse = (Math.sin(currentStep * 2 + r + c) + 1) / 2;

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2 + pulse * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = (r + c) % 4 === 0 
            ? `rgba(56, 189, 248, ${0.4 + pulse * 0.5})` 
            : `rgba(16, 185, 129, ${0.3 + pulse * 0.4})`;
          ctx.fill();
        }
      }
    };

    if (prefersReducedMotion) {
      drawFrame(0.5);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (canvas.parentElement) {
          canvas.parentElement.removeEventListener('mousemove', handleMouseMove);
        }
      };
    }

    const render = () => {
      step += 0.02;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      drawFrame(step);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas.parentElement) {
        canvas.parentElement.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 w-full h-full opacity-60 dark:opacity-75 ${className}`}
      aria-hidden="true"
    />
  );
}
