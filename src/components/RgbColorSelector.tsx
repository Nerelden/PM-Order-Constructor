import React from 'react';
import { Palette, RefreshCw } from 'lucide-react';
import { RGBColor, rgbToHex, hexToRgb } from '../types';

interface RgbColorSelectorProps {
  color: RGBColor;
  onChange: (newColor: RGBColor, hex: string) => void;
}

export const RgbColorSelector: React.FC<RgbColorSelectorProps> = ({ color, onChange }) => {
  const hex = rgbToHex(color.r, color.g, color.b);

  const handleRChange = (val: number) => {
    const clamped = Math.max(0, Math.min(255, val));
    const newColor = { ...color, r: clamped };
    onChange(newColor, rgbToHex(newColor.r, newColor.g, newColor.b));
  };

  const handleGChange = (val: number) => {
    const clamped = Math.max(0, Math.min(255, val));
    const newColor = { ...color, g: clamped };
    onChange(newColor, rgbToHex(newColor.r, newColor.g, newColor.b));
  };

  const handleBChange = (val: number) => {
    const clamped = Math.max(0, Math.min(255, val));
    const newColor = { ...color, b: clamped };
    onChange(newColor, rgbToHex(newColor.r, newColor.g, newColor.b));
  };

  const handleHexInput = (val: string) => {
    if (/^#[0-9A-Fa-f]{0,6}$/.test(val) || /^[0-9A-Fa-f]{0,6}$/.test(val)) {
      const formatted = val.startsWith('#') ? val : `#${val}`;
      if (formatted.length === 7) {
        const rgb = hexToRgb(formatted);
        onChange(rgb, formatted);
      }
    }
  };

  const handleColorPicker = (hexVal: string) => {
    const rgb = hexToRgb(hexVal);
    onChange(rgb, hexVal);
  };

  // Quick swatches for convenient selection
  const SWATCHES: { label: string; r: number; g: number; b: number }[] = [
    { label: 'Янтарь', r: 217, g: 119, b: 6 },
    { label: 'Циан', r: 6, g: 182, b: 212 },
    { label: 'Багряный', r: 220, g: 38, b: 38 },
    { label: 'Изумруд', r: 16, g: 185, b: 129 },
    { label: 'Фиолет', r: 168, g: 85, b: 247 },
    { label: 'Индиго', r: 99, g: 102, b: 241 },
    { label: 'Золото', r: 234, g: 179, b: 8 },
    { label: 'Сталь', r: 148, g: 163, b: 184 },
  ];

  return (
    <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Palette className="w-3.5 h-3.5 text-stone-400" />
          <span>Цветовая палитра бланка (RGB / HEX):</span>
        </label>
        <div className="flex items-center gap-2">
          {/* Live color badge */}
          <span
            className="w-4 h-4 rounded-full border border-stone-600 shadow-sm"
            style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
          />
          <span className="font-mono text-xs font-bold text-stone-200">
            RGB({color.r}, {color.g}, {color.b})
          </span>
        </div>
      </div>

      {/* Main RGB Sliders and Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
        {/* Native Color Picker & Hex preview */}
        <div className="flex items-center gap-2 bg-stone-900 p-2 rounded-lg border border-stone-800">
          <input
            type="color"
            value={hex}
            onChange={(e) => handleColorPicker(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
            title="Открыть палитру цветов"
          />
          <div className="flex-1 font-mono text-xs">
            <span className="text-[10px] text-stone-500 uppercase block">HEX</span>
            <input
              type="text"
              value={hex}
              onChange={(e) => handleHexInput(e.target.value)}
              className="w-full bg-transparent text-stone-200 font-bold focus:outline-none uppercase"
              maxLength={7}
            />
          </div>
        </div>

        {/* R (Red) */}
        <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="text-red-400 font-bold">R (Красный)</span>
            <span className="text-stone-300">{color.r}</span>
          </div>
          <input
            type="range"
            min={0}
            max={255}
            value={color.r}
            onChange={(e) => handleRChange(Number(e.target.value))}
            className="w-full accent-red-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
          />
        </div>

        {/* G (Green) */}
        <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="text-emerald-400 font-bold">G (Зеленый)</span>
            <span className="text-stone-300">{color.g}</span>
          </div>
          <input
            type="range"
            min={0}
            max={255}
            value={color.g}
            onChange={(e) => handleGChange(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
          />
        </div>

        {/* B (Blue) */}
        <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="text-blue-400 font-bold">B (Синий)</span>
            <span className="text-stone-300">{color.b}</span>
          </div>
          <input
            type="range"
            min={0}
            max={255}
            value={color.b}
            onChange={(e) => handleBChange(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
          />
        </div>
      </div>

      {/* Quick Swatches bar */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-mono text-stone-500 mr-1">Быстрый тон:</span>
        {SWATCHES.map((swatch, i) => (
          <button
            key={i}
            type="button"
            onClick={() =>
              onChange({ r: swatch.r, g: swatch.g, b: swatch.b }, rgbToHex(swatch.r, swatch.g, swatch.b))
            }
            className="px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 transition-colors"
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: `rgb(${swatch.r}, ${swatch.g}, ${swatch.b})` }}
            />
            <span className="text-stone-300">{swatch.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
