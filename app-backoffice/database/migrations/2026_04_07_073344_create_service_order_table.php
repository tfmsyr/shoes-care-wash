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
        Schema::create('service_order', function (Blueprint $table) {
            $table->id();
            
            // 1. TAMBAH INI: Biar nggak kena error 'Unknown column order_number'
            $table->string('order_number')->nullable();
            
            // 2. TAMBAH INI: Sesuai dengan Controller kamu yang nyimpen company_id dari Auth user
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            
            // 3. Customer ID (Aman)
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            
            // 4. WAJIB NULLABLE: Karena data layanan yang banyak (array) simpannya di tabel details
            $table->foreignId('service_id')->nullable()->constrained('services')->onDelete('cascade');
            
            // 5. Data lainnya
            $table->integer('discount')->default(0);
            $table->string('status')->default('received'); // Pakai string biar luwes sesuai frontend
            $table->text('notes')->nullable(); // Pakai text biar muat catatan panjang
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_order');
    }
};