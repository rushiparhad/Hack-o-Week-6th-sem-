import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * Header Component
 * Displays title and theme toggle button
 */
export default function Header({ isDark, setIsDark }) {
  return (
    <header className="sticky top-0 z-50 glass border-b dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="text-3xl">🏥</div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Alert System
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time Health Monitoring
            </p>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
}
