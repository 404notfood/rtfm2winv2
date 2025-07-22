<?php

namespace App\Services;

use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;
use App\Models\QuizSession;

class QRCodeService
{
    /**
     * Generate QR code for a quiz session
     */
    public function generateSessionQRCode(QuizSession $session): string
    {
        $joinUrl = url("/join/{$session->code}");
        
        // Generate QR code as SVG
        $qrCode = QrCode::format('svg')
            ->size(300)
            ->margin(2)
            ->errorCorrection('M')
            ->generate($joinUrl);
        
        // Create filename
        $filename = "qr-codes/session-{$session->code}.svg";
        
        // Store the QR code
        Storage::disk('public')->put($filename, $qrCode);
        
        // Return the public path
        return Storage::url($filename);
    }

    /**
     * Generate QR code as PNG for better compatibility
     */
    public function generateSessionQRCodePNG(QuizSession $session): string
    {
        $joinUrl = url("/join/{$session->code}");
        
        // Generate QR code as PNG
        $qrCode = QrCode::format('png')
            ->size(400)
            ->margin(2)
            ->errorCorrection('M')
            ->generate($joinUrl);
        
        // Create filename
        $filename = "qr-codes/session-{$session->code}.png";
        
        // Store the QR code
        Storage::disk('public')->put($filename, $qrCode);
        
        // Return the public path
        return Storage::url($filename);
    }

    /**
     * Generate QR code with custom styling
     */
    public function generateStyledSessionQRCode(QuizSession $session, array $options = []): string
    {
        $joinUrl = url("/join/{$session->code}");
        
        $qrCode = QrCode::format($options['format'] ?? 'svg')
            ->size($options['size'] ?? 300)
            ->margin($options['margin'] ?? 2)
            ->errorCorrection($options['errorCorrection'] ?? 'M');
        
        // Add custom styling if provided
        if (isset($options['color'])) {
            $qrCode->color($options['color'][0], $options['color'][1], $options['color'][2]);
        }
        
        if (isset($options['backgroundColor'])) {
            $qrCode->backgroundColor(
                $options['backgroundColor'][0],
                $options['backgroundColor'][1],
                $options['backgroundColor'][2]
            );
        }
        
        $qrCodeData = $qrCode->generate($joinUrl);
        
        // Create filename with options hash
        $optionsHash = md5(serialize($options));
        $extension = $options['format'] ?? 'svg';
        $filename = "qr-codes/session-{$session->code}-{$optionsHash}.{$extension}";
        
        // Store the QR code
        Storage::disk('public')->put($filename, $qrCodeData);
        
        // Return the public path
        return Storage::url($filename);
    }

    /**
     * Generate QR code for any URL
     */
    public function generateQRCodeForUrl(string $url, array $options = []): string
    {
        $qrCode = QrCode::format($options['format'] ?? 'svg')
            ->size($options['size'] ?? 300)
            ->margin($options['margin'] ?? 2)
            ->errorCorrection($options['errorCorrection'] ?? 'M')
            ->generate($url);
        
        // Create filename based on URL hash
        $urlHash = md5($url);
        $extension = $options['format'] ?? 'svg';
        $filename = "qr-codes/url-{$urlHash}.{$extension}";
        
        // Store the QR code
        Storage::disk('public')->put($filename, $qrCode);
        
        // Return the public path
        return Storage::url($filename);
    }

    /**
     * Delete QR code file
     */
    public function deleteSessionQRCode(QuizSession $session): bool
    {
        $patterns = [
            "qr-codes/session-{$session->code}.svg",
            "qr-codes/session-{$session->code}.png",
        ];
        
        $deleted = false;
        foreach ($patterns as $pattern) {
            if (Storage::disk('public')->exists($pattern)) {
                Storage::disk('public')->delete($pattern);
                $deleted = true;
            }
        }
        
        // Also delete any styled versions
        $files = Storage::disk('public')->files('qr-codes');
        foreach ($files as $file) {
            if (str_contains($file, "session-{$session->code}-")) {
                Storage::disk('public')->delete($file);
                $deleted = true;
            }
        }
        
        return $deleted;
    }

    /**
     * Clean up old QR codes (for maintenance)
     */
    public function cleanupOldQRCodes(int $daysOld = 30): int
    {
        $files = Storage::disk('public')->files('qr-codes');
        $deletedCount = 0;
        $cutoffTime = now()->subDays($daysOld)->timestamp;
        
        foreach ($files as $file) {
            $lastModified = Storage::disk('public')->lastModified($file);
            
            if ($lastModified < $cutoffTime) {
                Storage::disk('public')->delete($file);
                $deletedCount++;
            }
        }
        
        return $deletedCount;
    }

    /**
     * Get QR code data as base64 string (for inline display)
     */
    public function getQRCodeAsBase64(QuizSession $session, string $format = 'png'): string
    {
        $joinUrl = url("/join/{$session->code}");
        
        $qrCode = QrCode::format($format)
            ->size(300)
            ->margin(2)
            ->errorCorrection('M')
            ->generate($joinUrl);
        
        return 'data:image/' . $format . ';base64,' . base64_encode($qrCode);
    }

    /**
     * Check if QR code exists for session
     */
    public function qrCodeExists(QuizSession $session): bool
    {
        $patterns = [
            "qr-codes/session-{$session->code}.svg",
            "qr-codes/session-{$session->code}.png",
        ];
        
        foreach ($patterns as $pattern) {
            if (Storage::disk('public')->exists($pattern)) {
                return true;
            }
        }
        
        return false;
    }
}