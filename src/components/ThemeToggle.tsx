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
            {theme === "dark" ? "🌙" : "☀️"}
            <style jsx>{`
        .theme-toggle {
            background: rgba(120, 120, 128, 0.2);
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            transition: all 0.2s;
        }
        .theme-toggle:hover {
            background: rgba(120, 120, 128, 0.4);
        }
        .theme-toggle-placeholder {
            width: 40px;
            height: 40px;
        }
      `}</style>
        </button>
    );
}
