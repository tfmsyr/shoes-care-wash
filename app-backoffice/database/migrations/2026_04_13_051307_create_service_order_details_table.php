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
        // INI KUNCINYA BRAY: Namanya wajib service_order_details
        Schema::create('service_order_details', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke struk induk
            $table->foreignId('service_order_id')->constrained('service_order')->onDelete('cascade');
            
            // Relasi ke layanan/sepatu
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
            
            $table->integer('quantity');
            $table->integer('price');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_order_details');
    }
};