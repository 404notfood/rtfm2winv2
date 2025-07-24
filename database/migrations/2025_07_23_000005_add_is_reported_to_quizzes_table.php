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
        Schema::table('quizzes', function (Blueprint $table) {
            $table->boolean('is_reported')->default(false)->after('status');
            $table->timestamp('reported_at')->nullable()->after('is_reported');
            $table->text('report_reason')->nullable()->after('reported_at');
            
            $table->index(['is_reported', 'updated_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropIndex(['is_reported', 'updated_at']);
            $table->dropColumn(['is_reported', 'reported_at', 'report_reason']);
        });
    }
};