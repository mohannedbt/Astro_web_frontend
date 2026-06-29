import React, { useEffect, useRef } from 'react';

const Starfield = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars = [];
    let animationId;

    const initStars = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.3,
        speed: Math.random() * 0.15 + 0.05,
        alpha: Math.random(),
      }));
    };

    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      stars.forEach((star) => {
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        star.y -= star.speed;
        if (star.y < 0) star.y = canvas.height;
      });
      animationId = requestAnimationFrame(drawStars);
    };

    window.addEventListener('resize', initStars);
    initStars();
    drawStars();

    return () => {
      window.removeEventListener('resize', initStars);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      id="starfield"
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.4,
      }}
    />
  );
};

export default Starfield;
