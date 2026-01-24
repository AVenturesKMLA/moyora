'use client';

import { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

// Simplified land detection
const isLand = (lat: number, lon: number): boolean => {
    // North America
    if (lat > 25 && lat < 70 && lon > -130 && lon < -55) return true;
    if (lat > 15 && lat < 30 && lon > -110 && lon < -80) return true;
    // South America
    if (lat > -56 && lat < 12 && lon > -82 && lon < -34) return true;
    // Europe
    if (lat > 36 && lat < 71 && lon > -10 && lon < 40) return true;
    // Africa
    if (lat > -35 && lat < 37 && lon > -17 && lon < 52) return true;
    // Asia
    if (lat > 10 && lat < 77 && lon > 40 && lon < 150) return true;
    if (lat > -10 && lat < 10 && lon > 95 && lon < 140) return true;
    // Australia
    if (lat > -45 && lat < -10 && lon > 112 && lon < 155) return true;
    // Japan/Korea
    if (lat > 30 && lat < 46 && lon > 128 && lon < 146) return true;
    // UK
    if (lat > 50 && lat < 59 && lon > -8 && lon < 2) return true;
    // New Zealand
    if (lat > -47 && lat < -34 && lon > 166 && lon < 178) return true;
    return false;
};

// Network connections between cities (many more pairs)
const CITY_CONNECTIONS = [
    // Trans-Atlantic
    [0, 14], [0, 15], [0, 16], [1, 14], [2, 14], [4, 14], [8, 14],
    // US internal
    [0, 1], [0, 2], [0, 4], [0, 8], [1, 5], [2, 3], [3, 4], [5, 6],
    // Europe internal
    [14, 15], [14, 16], [14, 19], [15, 16], [15, 17], [15, 18], [16, 19], [17, 18], [16, 20], [20, 21],
    // Europe to Asia
    [14, 30], [16, 30], [20, 30], [20, 29], [21, 29], [21, 30],
    // Asia internal
    [22, 23], [22, 24], [22, 25], [23, 24], [23, 25], [24, 25], [24, 26], [25, 26], [26, 27], [27, 28],
    // Middle East connections
    [29, 30], [29, 31], [30, 31], [30, 21],
    // Africa connections
    [31, 32], [31, 33], [31, 34], [33, 34], [32, 34],
    // Oceania
    [27, 35], [27, 36], [35, 36], [22, 35],
    // South America
    [10, 11], [10, 12], [11, 12], [12, 13], [4, 10], [9, 10],
    // Cross Pacific
    [1, 22], [1, 23], [5, 23], [6, 22],
    // Long haul
    [0, 22], [14, 22], [14, 35], [10, 35], [32, 35],
];

const CITIES = [
    { lat: 40.71, lon: -74.01 }, { lat: 34.05, lon: -118.24 },
    { lat: 41.88, lon: -87.63 }, { lat: 29.76, lon: -95.37 },
    { lat: 25.76, lon: -80.19 }, { lat: 47.61, lon: -122.33 },
    { lat: 49.28, lon: -123.12 }, { lat: 45.50, lon: -73.57 },
    { lat: 43.65, lon: -79.38 }, { lat: 19.43, lon: -99.13 },
    { lat: -23.55, lon: -46.63 }, { lat: -22.91, lon: -43.17 },
    { lat: -34.60, lon: -58.38 }, { lat: -33.45, lon: -70.67 },
    { lat: 51.51, lon: -0.13 }, { lat: 48.86, lon: 2.35 },
    { lat: 52.52, lon: 13.41 }, { lat: 41.90, lon: 12.50 },
    { lat: 40.42, lon: -3.70 }, { lat: 52.37, lon: 4.90 },
    { lat: 55.76, lon: 37.62 }, { lat: 41.01, lon: 28.98 },
    { lat: 35.68, lon: 139.65 }, { lat: 37.57, lon: 126.98 },
    { lat: 31.23, lon: 121.47 }, { lat: 39.90, lon: 116.41 },
    { lat: 22.32, lon: 114.17 }, { lat: 1.35, lon: 103.82 },
    { lat: 13.76, lon: 100.50 }, { lat: 19.08, lon: 72.88 },
    { lat: 25.20, lon: 55.27 }, { lat: 30.04, lon: 31.24 },
    { lat: -33.92, lon: 18.42 }, { lat: 6.52, lon: 3.38 },
    { lat: -1.29, lon: 36.82 }, { lat: -33.87, lon: 151.21 },
    { lat: -37.81, lon: 144.96 },
];

const PALETTES = {
    dark: {
        bg: '#000005',
        landDot: '#ffffff',
        oceanDot: '#1a1a2e',
        node: '#00d4ff',
        line: '#00d4ff',
    },
    light: {
        bg: '#f0f4f8',
        landDot: '#1a2a3a',
        oceanDot: '#d0dae4',
        node: '#0066cc',
        line: '#0088ee',
    }
};

interface Connection {
    start: number;
    end: number;
    progress: number;
    phase: 'grow' | 'hold' | 'fade';
    opacity: number;
}

export default function NetworkMap3D() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotationRef = useRef(0);
    const connectionsRef = useRef<Connection[]>([]);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme !== 'light';
    const palette = isDark ? PALETTES.dark : PALETTES.light;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        // Generate evenly distributed points on sphere
        const points: { lat: number; lon: number; isLand: boolean }[] = [];
        const numPoints = 2500;
        const phi = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < numPoints; i++) {
            const y = 1 - (i / (numPoints - 1)) * 2;
            const radius = Math.sqrt(1 - y * y);
            const theta = phi * i;

            const lat = Math.asin(y) * (180 / Math.PI);
            const lon = Math.atan2(Math.sin(theta) * radius, Math.cos(theta) * radius) * (180 / Math.PI);

            points.push({ lat, lon, isLand: isLand(lat, lon) });
        }

        const latLonTo3D = (lat: number, lon: number, r: number = 1) => {
            const phi = (90 - lat) * Math.PI / 180;
            const theta = (lon + 180) * Math.PI / 180;
            return {
                x: -r * Math.sin(phi) * Math.cos(theta),
                y: r * Math.cos(phi),
                z: r * Math.sin(phi) * Math.sin(theta)
            };
        };

        const project = (x: number, y: number, z: number, cx: number, cy: number, scale: number, rot: number) => {
            const cos = Math.cos(rot);
            const sin = Math.sin(rot);
            const rx = x * cos - z * sin;
            const rz = x * sin + z * cos;
            return { x: cx + rx * scale, y: cy - y * scale, z: rz };
        };

        const getArcPoint = (p1: ReturnType<typeof latLonTo3D>, p2: ReturnType<typeof latLonTo3D>, t: number, h: number) => {
            const dot = p1.x * p2.x + p1.y * p2.y + p1.z * p2.z;
            const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
            if (angle < 0.01) return { ...p1 };
            const sinA = Math.sin(angle);
            const a = Math.sin((1 - t) * angle) / sinA;
            const b = Math.sin(t * angle) / sinA;
            let x = a * p1.x + b * p2.x;
            let y = a * p1.y + b * p2.y;
            let z = a * p1.z + b * p2.z;
            const lift = Math.sin(t * Math.PI) * h;
            const len = Math.sqrt(x * x + y * y + z * z);
            const s = (len + lift) / len;
            return { x: x * s, y: y * s, z: z * s };
        };

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        window.addEventListener('resize', resize);

        const cityPos = CITIES.map(c => latLonTo3D(c.lat, c.lon, 1.01));

        const animate = () => {
            const rect = canvas.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            const cx = w / 2;
            const cy = h / 2;
            const scale = Math.min(w, h) * 0.38;

            rotationRef.current += 0.002;

            // Clear
            ctx.fillStyle = palette.bg;
            ctx.fillRect(0, 0, w, h);

            // Spawn connections
            if (connectionsRef.current.length < 80 && Math.random() < 0.6) {
                const pair = CITY_CONNECTIONS[Math.floor(Math.random() * CITY_CONNECTIONS.length)];
                connectionsRef.current.push({
                    start: pair[0], end: pair[1],
                    progress: 0, phase: 'grow', opacity: 1
                });
            }

            // Update connections
            for (let i = connectionsRef.current.length - 1; i >= 0; i--) {
                const c = connectionsRef.current[i];
                if (c.phase === 'grow') {
                    c.progress += 0.025;
                    if (c.progress >= 1) { c.progress = 1; c.phase = 'hold'; }
                } else if (c.phase === 'hold') {
                    c.progress += 0.015;
                    if (c.progress >= 1.3) c.phase = 'fade';
                } else {
                    c.opacity -= 0.03;
                    if (c.opacity <= 0) connectionsRef.current.splice(i, 1);
                }
            }

            // Draw globe points
            const sortedPoints = points.map(p => {
                const pos = latLonTo3D(p.lat, p.lon);
                const proj = project(pos.x, pos.y, pos.z, cx, cy, scale, rotationRef.current);
                return { ...p, proj };
            }).sort((a, b) => a.proj.z - b.proj.z);

            for (const p of sortedPoints) {
                if (p.proj.z < -0.2) continue;

                const alpha = Math.max(0, Math.min(1, (p.proj.z + 0.5) * 0.8));
                const size = p.isLand ? (1.8 + p.proj.z * 0.8) : (0.8 + p.proj.z * 0.3);

                ctx.beginPath();
                ctx.arc(p.proj.x, p.proj.y, size, 0, Math.PI * 2);
                ctx.fillStyle = p.isLand ? palette.landDot : palette.oceanDot;
                ctx.globalAlpha = p.isLand ? alpha : alpha * 0.4;
                ctx.fill();
            }

            ctx.globalAlpha = 1;

            // Draw connections
            for (const conn of connectionsRef.current) {
                const p1 = cityPos[conn.start];
                const p2 = cityPos[conn.end];
                const segments = 25;
                const drawSegs = Math.floor(segments * Math.min(1, conn.progress));

                ctx.beginPath();
                let started = false;

                for (let i = 0; i <= drawSegs; i++) {
                    const t = i / segments;
                    const ap = getArcPoint(p1, p2, t, 0.15);
                    const proj = project(ap.x, ap.y, ap.z, cx, cy, scale, rotationRef.current);

                    if (proj.z > -0.1) {
                        if (!started) {
                            ctx.moveTo(proj.x, proj.y);
                            started = true;
                        } else {
                            ctx.lineTo(proj.x, proj.y);
                        }
                    }
                }

                ctx.strokeStyle = palette.line;
                ctx.lineWidth = 2;
                ctx.globalAlpha = conn.opacity * 0.8;
                ctx.stroke();
            }

            ctx.globalAlpha = 1;

            // Draw city nodes
            for (let i = 0; i < cityPos.length; i++) {
                const pos = cityPos[i];
                const proj = project(pos.x, pos.y, pos.z, cx, cy, scale, rotationRef.current);

                if (proj.z > 0) {
                    ctx.beginPath();
                    ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = palette.node;
                    ctx.globalAlpha = 0.5 + proj.z * 0.5;
                    ctx.fill();
                }
            }

            ctx.globalAlpha = 1;
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [palette, isDark]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
}
