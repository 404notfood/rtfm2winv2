import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette } from 'lucide-react';
import { useState } from 'react';

interface Props {
    label: string;
    value: string;
    onChange: (color: string) => void;
}

const presetColors = [
    '#000000',
    '#ffffff',
    '#f8fafc',
    '#f1f5f9',
    '#e2e8f0',
    '#cbd5e1',
    '#94a3b8',
    '#64748b',
    '#475569',
    '#334155',
    '#1e293b',
    '#0f172a',
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
];

export function ColorPicker({ label, value, onChange }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Validate hex color
        if (/^#[0-9A-F]{6}$/i.test(newValue)) {
            onChange(newValue);
        }
    };

    const handlePresetClick = (color: string) => {
        setInputValue(color);
        onChange(color);
        setIsOpen(false);
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input value={inputValue} onChange={handleInputChange} placeholder="#000000" className="font-mono" />
                    <div
                        className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 transform rounded border border-gray-300"
                        style={{ backgroundColor: value }}
                    />
                </div>

                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Palette className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">Couleurs prédéfinies</Label>
                                <div className="mt-2 grid grid-cols-8 gap-2">
                                    {presetColors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => handlePresetClick(color)}
                                            className={`h-8 w-8 rounded border-2 transition-transform hover:scale-110 ${
                                                value === color ? 'border-blue-500' : 'border-gray-300'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Sélecteur de couleur</Label>
                                <input
                                    type="color"
                                    value={value}
                                    onChange={(e) => {
                                        setInputValue(e.target.value);
                                        onChange(e.target.value);
                                    }}
                                    className="mt-2 h-10 w-full cursor-pointer rounded border border-gray-300"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Code couleur</Label>
                                <Input value={inputValue} onChange={handleInputChange} placeholder="#000000" className="mt-2 font-mono" />
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
