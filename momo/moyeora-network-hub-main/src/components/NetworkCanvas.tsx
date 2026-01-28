import { useEffect, useRef, useCallback } from 'react';
import { Club } from '@/data/demoData';

interface NetworkCanvasProps {
  clubs: Club[];
  links: [string, string][];
  onClubClick?: (clubId: string) => void;
  height?: number;
}

interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  trust: number;
  name: string;
  school: string;
}

export function NetworkCanvas({ clubs, links, onClubClick, height = 420 }: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simNodesRef = useRef<SimNode[]>([]);
  const draggingRef = useRef<SimNode | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const getRadius = useCallback((trust: number, dpr: number) => {
    if (trust >= 85) return 14 * dpr;
    if (trust >= 75) return 12 * dpr;
    return 10 * dpr;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    };
    resize();

    const W = canvas.width;
    const H = canvas.height;

    // Initialize simulation nodes
    simNodesRef.current = clubs.map(n => ({
      id: n.id,
      x: (Math.random() * 0.7 + 0.15) * W,
      y: (Math.random() * 0.7 + 0.15) * H,
      vx: 0,
      vy: 0,
      trust: n.trust,
      name: n.name,
      school: n.school,
    }));

    const idx = new Map(simNodesRef.current.map((n, i) => [n.id, i]));
    const simLinks = links
      .map(([a, b]) => ({ a: idx.get(a), b: idx.get(b) }))
      .filter((l): l is { a: number; b: number } => l.a != null && l.b != null);

    const pickNode = (x: number, y: number): SimNode | null => {
      for (let i = simNodesRef.current.length - 1; i >= 0; i--) {
        const n = simNodesRef.current[i];
        const r = getRadius(n.trust, dpr);
        if ((x - n.x) ** 2 + (y - n.y) ** 2 <= r ** 2) return n;
      }
      return null;
    };

    const toLocal = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * dpr,
        y: (e.clientY - r.top) * dpr,
      };
    };

    const onPointerDown = (e: PointerEvent) => {
      const p = toLocal(e);
      const hit = pickNode(p.x, p.y);
      if (hit) {
        draggingRef.current = hit;
        hit.vx = hit.vy = 0;
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const p = toLocal(e);
      mouseRef.current = p;
      if (draggingRef.current) {
        draggingRef.current.x = p.x;
        draggingRef.current.y = p.y;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (draggingRef.current) {
        const p = toLocal(e);
        const dist = Math.hypot(p.x - draggingRef.current.x, p.y - draggingRef.current.y);
        if (dist < 2 && onClubClick) {
          onClubClick(draggingRef.current.id);
        }
      }
      draggingRef.current = null;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);

    const step = () => {
      const centerX = W * 0.5;
      const centerY = H * 0.5;

      for (const n of simNodesRef.current) {
        // Pull to center
        n.vx += (centerX - n.x) * 0.0007;
        n.vy += (centerY - n.y) * 0.0007;

        // Mouse repel
        const dx = n.x - mouseRef.current.x;
        const dy = n.y - mouseRef.current.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < (160 * dpr) ** 2 && d2 > 1) {
          const k = 0.55 / d2;
          n.vx += dx * k;
          n.vy += dy * k;
        }
      }

      // Link springs
      for (const l of simLinks) {
        const a = simNodesRef.current[l.a];
        const b = simNodesRef.current[l.b];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;
        const target = 150 * dpr;
        const k = 0.0009;
        const f = (dist - target) * k;
        const fx = (dx / dist) * f;
        const fy = (dy / dist) * f;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      // Collision
      for (let i = 0; i < simNodesRef.current.length; i++) {
        for (let j = i + 1; j < simNodesRef.current.length; j++) {
          const a = simNodesRef.current[i];
          const b = simNodesRef.current[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          const min = getRadius(a.trust, dpr) + getRadius(b.trust, dpr) + 8 * dpr;
          if (dist < min) {
            const push = (min - dist) * 0.0028;
            const fx = (dx / dist) * push;
            const fy = (dy / dist) * push;
            a.vx -= fx;
            a.vy -= fy;
            b.vx += fx;
            b.vy += fy;
          }
        }
      }

      // Integrate
      for (const n of simNodesRef.current) {
        if (n !== draggingRef.current) {
          n.vx *= 0.92;
          n.vy *= 0.92;
          n.x += n.vx;
          n.y += n.vy;
        }
        n.x = Math.max(20 * dpr, Math.min(W - 20 * dpr, n.x));
        n.y = Math.max(20 * dpr, Math.min(H - 20 * dpr, n.y));
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Grid
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1 * dpr;
      const stepg = 60 * dpr;
      for (let x = 0; x < W; x += stepg) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += stepg) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Links
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = 'rgba(124,92,255,0.22)';
      for (const l of simLinks) {
        const a = simNodesRef.current[l.a];
        const b = simNodesRef.current[l.b];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Nodes
      for (const n of simNodesRef.current) {
        const r = getRadius(n.trust, dpr);
        const isHot = n.trust >= 85;

        // Glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 8 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = isHot ? 'rgba(48,213,200,0.12)' : 'rgba(124,92,255,0.10)';
        ctx.fill();

        // Body
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isHot ? 'rgba(48,213,200,0.85)' : 'rgba(124,92,255,0.85)';
        ctx.fill();

        // Label
        ctx.font = `${12 * dpr}px ui-sans-serif`;
        ctx.fillStyle = 'rgba(232,236,255,0.92)';
        ctx.textAlign = 'center';
        ctx.fillText(n.school, n.x, n.y + r + 18 * dpr);
      }

      // Hover ring
      const hit = pickNode(mouseRef.current.x, mouseRef.current.y);
      if (hit) {
        ctx.beginPath();
        ctx.arc(hit.x, hit.y, getRadius(hit.trust, dpr) + 6 * dpr, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
      }
    };

    const tick = () => {
      step();
      draw();
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();

    const handleResize = () => {
      resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [clubs, links, onClubClick, getRadius]);

  return (
    <div className="map-wrap" style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute left-3.5 bottom-3.5 flex gap-2 flex-wrap">
        <div className="pill">드래그: 노드 이동</div>
        <div className="pill">클릭: 동아리 상세</div>
      </div>
    </div>
  );
}
