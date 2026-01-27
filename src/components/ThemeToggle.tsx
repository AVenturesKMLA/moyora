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
            <div className={`toggle-thumb ${theme === 'dark' ? 'dark' : 'light'}`} />
            <style jsx>{`
        .theme-toggle {
            position: relative;
            width: 44px;
            height: 24px;
            background: rgba(120, 120, 128, 0.2);
            border: 1px solid rgba(120, 120, 128, 0.2);
            border-radius: 999px;
            cursor: pointer;
            padding: 2px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
        }
        .theme-toggle:hover {
            background: rgba(120, 120, 128, 0.3);
        }
        .toggle-thumb {
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .toggle-thumb.light {
            transform: translateX(0);
        }
        .toggle-thumb.dark {
            transform: translateX(20px);
            background: #1F4EF5; /* or a nice dark mode indicator color */
        }
        .theme-toggle-placeholder {
            width: 44px;
            height: 24px;
        }
      `}</style>
        </button>
    );
}
