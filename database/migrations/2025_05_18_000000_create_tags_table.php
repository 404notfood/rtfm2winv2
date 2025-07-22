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
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->string('slug', 60)->unique();
            $table->string('description')->nullable();
            $table->string('color', 20)->nullable()->default('#3498db');
            $table->timestamps();
        });

        // Table pivot pour la relation many-to-many entre Quiz et Tag
        Schema::create('quiz_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // Un quiz ne peut avoir le même tag qu'une seule fois
            $table->unique(['quiz_id', 'tag_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_tag');
        Schema::dropIfExists('tags');
    }
}; 