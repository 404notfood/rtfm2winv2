<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_reported')->default(false)->after('email_verified_at');
            $table->timestamp('reported_at')->nullable()->after('is_reported');
            $table->text('report_reason')->nullable()->after('reported_at');
            $table->boolean('is_banned')->default(false)->after('report_reason');
            $table->timestamp('banned_at')->nullable()->after('is_banned');
            $table->text('ban_reason')->nullable()->after('banned_at');
            
            $table->index(['is_reported', 'updated_at']);
            $table->index(['is_banned', 'updated_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['is_reported', 'updated_at']);
            $table->dropIndex(['is_banned', 'updated_at']);
            $table->dropColumn(['is_reported', 'reported_at', 'report_reason', 'is_banned', 'banned_at', 'ban_reason']);
        });
    }
};