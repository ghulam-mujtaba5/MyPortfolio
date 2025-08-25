"use client";
import React, { useRef, useEffect, useMemo } from "react";
import { useTheme } from "../../context/ThemeContext";
import styles from './PlexusCanvas.module.css';

interface PlexusCanvasProps {
  maxNodes?: number;
  maxDistance?: number;
  speed?: number;
}

function hexToRgba(hex: string, alpha: number) {
  const c = hex.replace('#','');
  const bigint = parseInt(c, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function PlexusCanvas({
  maxNodes = 150, // Optimal for 2D performance
  maxDistance = 120, // Optimal for 2D connections
  speed = 1, // Balanced speed
}: PlexusCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const { theme } = useTheme();

  const colors = useMemo(() => {
    const brandPrimary = "#4573df";
    const brandAccentWeak = "#667eea";
    return theme === "dark" ? {
      node: brandAccentWeak, line: brandPrimary, nodeAlpha: 0.9, lineAlpha: 0.5 // Increased visibility
    } : {
      node: brandPrimary, line: brandPrimary, nodeAlpha: 0.9, lineAlpha: 0.4 // Increased visibility
    };
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const mouse = { x: w / 2, y: h / 2 };

    type Node = { x: number; y: number; vx: number; vy: number; size: number; };
    let nodes: Node[] = [];
    let running = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = rect.height;
      nodes = Array.from({ length: maxNodes }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * 2 + 1, // Subtle depth illusion
      }));
    };

    const step = () => {
      if (!running) return;

      ctx.clearRect(0, 0, w, h);

      // Update and draw nodes
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;

        // Boundary checks
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        ctx.fillStyle = hexToRgba(colors.node, colors.nodeAlpha);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < maxDistance) {
            const opacity = Math.max(0, 1 - d / maxDistance) * colors.lineAlpha;
            ctx.strokeStyle = hexToRgba(colors.line, opacity);
            ctx.lineWidth = 1.5; // Thicker lines
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Mouse interaction lines
      const mouseNode = { ...mouse, size: 0 };
      for (const n of nodes) {
        const d = Math.hypot(mouseNode.x - n.x, mouseNode.y - n.y);
        if (d < maxDistance * 1.5) {
          const opacity = Math.max(0, 1 - d / (maxDistance * 1.5)) * colors.lineAlpha * 3; // Stronger mouse lines
          ctx.strokeStyle = hexToRgba(colors.line, opacity);
          ctx.lineWidth = 1.5; // Thicker lines
          ctx.beginPath();
          ctx.moveTo(mouseNode.x, mouseNode.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(step);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const onVisibilityChange = () => {
      running = !document.hidden;
      if (running) animationRef.current = requestAnimationFrame(step);
    };

    resize();
    step();

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouseMove);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      running = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [colors, maxNodes, maxDistance, speed]);

  return <canvas ref={canvasRef} className={styles.plexusCanvas} />;
}
