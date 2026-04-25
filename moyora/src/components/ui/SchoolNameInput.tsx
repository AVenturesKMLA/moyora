'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { searchSchools } from '@/lib/schools';
import { School } from 'lucide-react';

interface SchoolNameInputProps {
    id?: string;
    name?: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    hasError?: boolean;
}

export default function SchoolNameInput({
    id,
    name,
    value,
    onChange,
    className,
    placeholder = '학교명을 입력해주세요',
    hasError = false,
}: SchoolNameInputProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIdx, setHighlightedIdx] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);
        const results = searchSchools(val);
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setHighlightedIdx(-1);
    };

    const handleSelect = useCallback((school: string) => {
        onChange(school);
        setSuggestions([]);
        setIsOpen(false);
        setHighlightedIdx(-1);
        inputRef.current?.blur();
    }, [onChange]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIdx((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIdx((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            if (highlightedIdx >= 0 && suggestions[highlightedIdx]) {
                e.preventDefault();
                handleSelect(suggestions[highlightedIdx]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <Input
                ref={inputRef}
                id={id}
                name={name}
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    if (suggestions.length > 0) setIsOpen(true);
                }}
                placeholder={placeholder}
                autoComplete="off"
                className={cn(hasError ? 'border-destructive focus-visible:ring-destructive' : '', className)}
                aria-autocomplete="list"
                aria-expanded={isOpen}
            />
            {isOpen && suggestions.length > 0 && (
                <ul
                    role="listbox"
                    className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden"
                >
                    {suggestions.map((school, idx) => (
                        <li
                            key={school}
                            role="option"
                            aria-selected={highlightedIdx === idx}
                            onMouseDown={(e) => {
                                e.preventDefault(); // prevent blur before click
                                handleSelect(school);
                            }}
                            onMouseEnter={() => setHighlightedIdx(idx)}
                            className={cn(
                                'flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer transition-colors',
                                highlightedIdx === idx
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <School className="h-3.5 w-3.5 shrink-0 opacity-60" />
                            <span>{school}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
