<?php

namespace App\Console\Commands;

use App\Services\QRCodeService;
use Illuminate\Console\Command;

class CleanupQRCodes extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'qr:cleanup {--days=30 : Number of days old QR codes to delete}';

    /**
     * The console command description.
     */
    protected $description = 'Clean up old QR code files to save storage space';

    /**
     * Execute the console command.
     */
    public function handle(QRCodeService $qrCodeService): int
    {
        $days = (int) $this->option('days');
        
        $this->info("Cleaning up QR codes older than {$days} days...");
        
        $deletedCount = $qrCodeService->cleanupOldQRCodes($days);
        
        if ($deletedCount > 0) {
            $this->info("Successfully deleted {$deletedCount} old QR code files.");
        } else {
            $this->info("No old QR code files found to delete.");
        }
        
        return Command::SUCCESS;
    }
}