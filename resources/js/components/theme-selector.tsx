import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { availableThemes, useAppearance, type Theme } from '@/hooks/use-appearance';
import { Check, Palette } from 'lucide-react';

export function ThemeSelector() {
    const { theme, updateTheme } = useAppearance();

    const currentThemeLabel = availableThemes.find((t) => t.value === theme)?.label || 'Système';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8">
                    <Palette className="h-4 w-4" />
                    <span className="sr-only">Changer de thème</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Thème: {currentThemeLabel}</div>
                {availableThemes.map((themeOption) => (
                    <DropdownMenuItem
                        key={themeOption.value}
                        onClick={() => updateTheme(themeOption.value)}
                        className="flex cursor-pointer items-center justify-between"
                    >
                        <div className="flex flex-col">
                            <span className="font-medium">{themeOption.label}</span>
                            <span className="text-xs text-muted-foreground">{themeOption.description}</span>
                        </div>
                        {theme === themeOption.value && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function ThemePreview({ theme }: { theme: Theme }) {
    const previewColors = {
        light: { bg: '#FFFFFF', primary: '#1E88E5', secondary: '#E91E63' },
        dark: { bg: '#121212', primary: '#2196F3', secondary: '#FF4081' },
        neon: { bg: '#0D1117', primary: '#00D4FF', secondary: '#FF073A' },
        pastel: { bg: '#F8F9FA', primary: '#A78BFA', secondary: '#F472B6' },
        fun: { bg: '#FFF7ED', primary: '#F97316', secondary: '#EC4899' },
        elegant: { bg: '#FAFAFA', primary: '#6366F1', secondary: '#8B5CF6' },
        system: { bg: '#F5F5F5', primary: '#3B82F6', secondary: '#8B5CF6' },
    };

    const colors = previewColors[theme] || previewColors.system;

    return (
        <div className="flex h-6 w-12 overflow-hidden rounded-sm border border-border" style={{ backgroundColor: colors.bg }}>
            <div className="flex-1" style={{ backgroundColor: colors.primary }} />
            <div className="flex-1" style={{ backgroundColor: colors.secondary }} />
        </div>
    );
}
