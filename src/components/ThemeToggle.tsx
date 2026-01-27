"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="theme-toggle-placeholder" />;
    }

    return (
        <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
        >
            <span className="toggle-text">테마</span>
            <style jsx>{`
        .theme-toggle {
            background: rgba(120, 120, 128, 0.1);
            border: 1px solid rgba(120, 120, 128, 0.2);
            padding: 6px 14px;
            height: 36px;
            border-radius: 999px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        .theme-toggle:hover {
            background: rgba(120, 120, 128, 0.2);
        }
        .toggle-text {
            font-size: 14px;
            font-weight: 600;
            color: var(--color-text-primary);
        }
        .theme-toggle-placeholder {
            width: 40px;
            height: 36px;
        }
      `}</style>
        </button>
    );
}
