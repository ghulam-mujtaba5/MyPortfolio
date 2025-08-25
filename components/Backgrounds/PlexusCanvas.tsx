"use client";
import React, { useRef, useEffect, useMemo } from "react";
import { useTheme } from "../../context/ThemeContext";
import styles from './PlexusCanvas.module.css';

interface PlexusCanvasProps {
  maxNodes?: number;
  maxDistance?: number;
  speed?: number;
  interaction?: "attract" | "repel";
  intensity?: number; // mouse influence multiplier
  hoverBoost?: boolean; // increase connection opacity when hovering
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
  maxNodes = 150,
  maxDistance = 120,
  speed = 1,
  interaction = "attract",
  intensity = 1,
  hoverBoost = true,
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

    // Handle DPR for crisp rendering
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

    let w = 0, h = 0;
    const mouse = { x: 0, y: 0, inside: false };

    type Node = { x: number; y: number; vx: number; vy: number; size: number; };
    let nodes: Node[] = [];
    let running = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const isMobile = window.matchMedia && window.matchMedia("(max-width: 576px)").matches;
      const targetNodes = Math.max(20, Math.floor(maxNodes * (isMobile ? 0.6 : 1)));
      nodes = Array.from({ length: targetNodes }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * 2 + 1,
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
            let opacity = Math.max(0, 1 - d / maxDistance) * colors.lineAlpha;
            if (hoverBoost && mouse.inside) opacity *= 1.2;
            ctx.strokeStyle = hexToRgba(colors.line, opacity);
            ctx.lineWidth = 1.5; // Thicker lines
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Mouse interaction lines + influence
      if (mouse.inside) {
        for (const n of nodes) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d = Math.hypot(dx, dy);
          if (d < maxDistance * 1.5) {
            const factor = Math.max(0, 1 - d / (maxDistance * 1.5));
            // Influence velocity
            const influence = (intensity * factor) / 50; // gentle influence
            if (interaction === "attract") {
              n.vx += (dx / (d || 1)) * influence;
              n.vy += (dy / (d || 1)) * influence;
            } else {
              n.vx -= (dx / (d || 1)) * influence;
              n.vy -= (dy / (d || 1)) * influence;
            }

            // Draw mouse connection
            const opacity = factor * colors.lineAlpha * 3;
            ctx.strokeStyle = hexToRgba(colors.line, opacity);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(step);
    };

    let pending = false;
    let lastEvent: MouseEvent | null = null;
    const handleMove = (e: MouseEvent) => {
      lastEvent = e;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        const rect = canvas.getBoundingClientRect();
        const x = (lastEvent as MouseEvent).clientX - rect.left;
        const y = (lastEvent as MouseEvent).clientY - rect.top;
        mouse.x = x;
        mouse.y = y;
        mouse.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
        pending = false;
      });
    };

    const onMouseLeaveDoc = () => {
      mouse.inside = false;
    };

    const onVisibilityChange = () => {
      running = !document.hidden;
      if (running) animationRef.current = requestAnimationFrame(step);
    };

    resize();
    step();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", onMouseLeaveDoc);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      running = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", onMouseLeaveDoc);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [colors, maxNodes, maxDistance, speed, interaction, intensity, hoverBoost]);

  // Respect prefers-reduced-motion: render a static frame if user prefers reduced motion
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    // Simple static dots background
    const count = 60;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const r = Math.random() * 2 + 1;
      ctx.fillStyle = hexToRgba(colors.node, 0.6);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [colors]);

  return <canvas ref={canvasRef} className={styles.plexusCanvas} />;
}
