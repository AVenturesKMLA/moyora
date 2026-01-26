'use client';

import { useRef, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

// Simplified continent polygons (lon, lat pairs) - derived from Natural Earth 110m
// Each continent is an array of polygons, each polygon is an array of [lon, lat] points
const CONTINENTS: number[][][] = [
    // North America (simplified outline)
    [[-168, 65], [-166, 60], [-164, 58], [-158, 55], [-152, 57], [-141, 60], [-139, 60], [-136, 58], [-133, 54], [-130, 52], [-125, 48], [-124, 42], [-117, 32], [-110, 24], [-105, 20], [-97, 18], [-88, 16], [-83, 10], [-79, 9], [-77, 8], [-82, 10], [-87, 22], [-81, 25], [-80, 28], [-81, 32], [-76, 35], [-75, 38], [-70, 41], [-67, 45], [-64, 47], [-61, 47], [-53, 47], [-55, 52], [-60, 55], [-65, 60], [-73, 64], [-85, 67], [-95, 70], [-110, 72], [-125, 71], [-145, 70], [-157, 68], [-168, 65]],
    // South America
    [[-81, 8], [-77, 6], [-72, 11], [-67, 11], [-63, 10], [-61, 5], [-55, 5], [-50, 2], [-48, -4], [-35, -5], [-35, -10], [-38, -15], [-40, -22], [-48, -28], [-53, -33], [-58, -38], [-65, -46], [-68, -52], [-68, -55], [-63, -55], [-57, -52], [-68, -45], [-71, -40], [-73, -37], [-72, -32], [-71, -26], [-70, -18], [-75, -14], [-76, -8], [-80, -3], [-80, 1], [-77, 6], [-81, 8]],
    // Europe
    [[-10, 36], [-9, 43], [-5, 44], [0, 43], [3, 43], [6, 43], [10, 44], [13, 46], [14, 50], [14, 54], [10, 54], [10, 56], [12, 56], [12, 58], [18, 60], [25, 60], [28, 58], [26, 56], [22, 55], [20, 54], [17, 55], [14, 53], [14, 48], [20, 47], [22, 42], [26, 40], [28, 36], [22, 35], [18, 35], [10, 38], [5, 38], [0, 37], [-5, 36], [-10, 36]],
    // Africa
    [[-17, 21], [-17, 15], [-12, 12], [-5, 10], [5, 6], [10, 4], [12, 4], [15, 2], [18, -3], [25, -3], [30, -15], [35, -20], [40, -25], [35, -34], [27, -34], [20, -33], [15, -27], [12, -17], [10, -5], [8, 5], [3, 6], [0, 10], [-5, 12], [-10, 15], [-17, 21]],
    // Asia (main)
    [[26, 40], [30, 42], [35, 42], [40, 43], [45, 40], [50, 40], [55, 45], [60, 48], [65, 55], [70, 60], [75, 67], [85, 72], [95, 75], [105, 72], [115, 70], [125, 65], [130, 60], [135, 55], [140, 50], [145, 45], [142, 40], [138, 35], [130, 30], [120, 22], [115, 18], [105, 15], [100, 10], [95, 8], [92, 22], [88, 22], [80, 28], [75, 25], [70, 20], [65, 28], [52, 30], [42, 35], [35, 37], [29, 36], [26, 40]],
    // Australia
    [[115, -21], [120, -18], [130, -12], [138, -12], [145, -15], [150, -20], [153, -25], [150, -35], [145, -38], [140, -38], [135, -35], [130, -32], [120, -33], [115, -30], [113, -25], [115, -21]],
    // Japan (simplified)
    [[130, 31], [132, 33], [135, 35], [138, 37], [140, 40], [141, 43], [145, 44], [145, 42], [141, 38], [139, 35], [137, 34], [136, 33], [134, 32], [131, 30], [130, 31]],
    // UK & Ireland
    [[-10, 51], [-6, 52], [-5, 54], [-6, 56], [-4, 58], [0, 59], [2, 56], [1, 52], [-3, 50], [-5, 50], [-10, 51]],
    // New Zealand (North)
    [[173, -37], [175, -38], [178, -38], [178, -41], [175, -42], [173, -40], [173, -37]],
    // New Zealand (South)
    [[168, -44], [170, -43], [173, -43], [174, -45], [171, -46], [168, -46], [167, -45], [168, -44]],
    // Indonesia (main islands simplified)
    [[95, -6], [100, -6], [105, -6], [108, -7], [110, -8], [115, -8], [118, -8], [120, -5], [127, -3], [130, -2], [135, -2], [140, -3], [141, -8], [138, -7], [133, -5], [127, -4], [120, -8], [115, -8], [110, -7], [105, -6], [100, -1], [95, -3], [95, -6]],
    // India subcontinent
    [[68, 24], [72, 20], [73, 15], [77, 8], [80, 12], [85, 20], [88, 22], [92, 22], [88, 27], [82, 27], [77, 30], [72, 28], [68, 24]],
    // Middle East
    [[35, 32], [40, 37], [45, 38], [48, 30], [55, 26], [52, 23], [48, 24], [44, 30], [42, 32], [35, 32]],
    // Madagascar
    [[44, -12], [48, -15], [50, -20], [48, -25], [44, -25], [43, -20], [44, -12]],
    // Greenland
    [[-45, 60], [-42, 64], [-35, 70], [-25, 75], [-20, 78], [-22, 82], [-35, 83], [-45, 82], [-55, 78], [-58, 75], [-60, 70], [-55, 62], [-45, 60]],
    // Scandinavia
    [[5, 58], [10, 60], [15, 65], [20, 70], [28, 70], [30, 65], [25, 60], [18, 56], [12, 56], [8, 58], [5, 58]],
    // Philippines (simplified)
    [[117, 6], [120, 10], [123, 13], [126, 14], [127, 10], [125, 6], [121, 5], [117, 6]],
    // Taiwan
    [[120, 22], [121, 23], [122, 25], [121, 25], [120, 23], [120, 22]],
    // Sri Lanka
    [[80, 6], [81, 8], [82, 8], [81, 6], [80, 6]],
    // Korean Peninsula
    [[126, 34], [127, 36], [128, 38], [130, 40], [128, 43], [125, 40], [126, 37], [126, 34]],
];

// Point-in-polygon using ray casting
const pointInPolygon = (lon: number, lat: number, polygon: number[][]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];
        if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
};

// Check if a point is on land
const isLand = (lat: number, lon: number): boolean => {
    // Normalize longitude to [-180, 180]
    while (lon > 180) lon -= 360;
    while (lon < -180) lon += 360;

    for (const continent of CONTINENTS) {
        if (pointInPolygon(lon, lat, continent)) {
            return true;
        }
    }
    return false;
};

// Network connections between cities
const CITY_CONNECTIONS = [
    [0, 14], [0, 15], [0, 16], [1, 14], [2, 14], [4, 14], [8, 14],
    [0, 1], [0, 2], [0, 4], [0, 8], [1, 5], [2, 3], [3, 4], [5, 6],
    [14, 15], [14, 16], [14, 19], [15, 16], [15, 17], [15, 18], [16, 19], [17, 18], [16, 20], [20, 21],
    [14, 30], [16, 30], [20, 30], [20, 29], [21, 29], [21, 30],
    [22, 23], [22, 24], [22, 25], [23, 24], [23, 25], [24, 25], [24, 26], [25, 26], [26, 27], [27, 28],
    [29, 30], [29, 31], [30, 31], [30, 21],
    [31, 32], [31, 33], [31, 34], [33, 34], [32, 34],
    [27, 35], [27, 36], [35, 36], [22, 35],
    [10, 11], [10, 12], [11, 12], [12, 13], [4, 10], [9, 10],
    [1, 22], [1, 23], [5, 23], [6, 22],
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
        bg: 'transparent',
        landDot: '#B1B8C0',       // Brand Gray
        oceanDot: '#111118',
        node: '#1F4EF5',         // Brand Blue
        line: '#4880EE',         // Brand Sub Blue
    },
    light: {
        bg: 'transparent',
        landDot: '#64768C',      // Sub Gray
        oceanDot: '#f1f5f9',
        node: '#1F4EF5',
        line: '#83B4F9',
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
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();

    // Wait for mount to avoid hydration issues via tunnel
    useEffect(() => {
        setMounted(true);
    }, []);

    // Default to dark if theme not resolved yet (common with tunnels)
    const isDark = !mounted || resolvedTheme !== 'light';
    const palette = isDark ? PALETTES.dark : PALETTES.light;

    useEffect(() => {
        if (!mounted) return; // Don't render until mounted

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        // Generate evenly distributed points on sphere using Fibonacci lattice
        const points: { lat: number; lon: number; isLand: boolean }[] = [];
        const numPoints = 3000; // More points for better continent detail
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
            const phiAngle = (90 - lat) * Math.PI / 180;
            const theta = (lon + 180) * Math.PI / 180;
            return {
                x: -r * Math.sin(phiAngle) * Math.cos(theta),
                y: r * Math.cos(phiAngle),
                z: r * Math.sin(phiAngle) * Math.sin(theta)
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

            // Clear canvas properly for transparent background
            ctx.clearRect(0, 0, w, h);

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
    }, [palette, isDark, mounted]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
}
