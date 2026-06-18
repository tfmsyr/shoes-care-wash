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
        // 1. Tabel Utama: Product Orders (Header)
        Schema::create('product_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // Contoh: ORD001
            $table->string('status')->default('received'); // Status pesanan
            $table->string('customer_name');
            $table->string('whatsapp_number');
            
            // Perhitungan Harga
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0); // Diskon nominal (Rp)
            $table->decimal('total_amount', 15, 2)->default(0); // Total akhir
            
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2. Tabel Detail: Product Order Items (Daftar barang yang dibeli)
        Schema::create('product_order_items', function (Blueprint $table) {
            $table->id();
            // Menghubungkan item ke Order di atas
            $table->foreignId('product_order_id')
                  ->constrained('product_orders')
                  ->onDelete('cascade'); 
            
            // Menghubungkan item ke Tabel Products yang sudah Mas punya
            $table->foreignId('product_id')->constrained('products');
            
            $table->integer('qty');
            $table->decimal('price', 15, 2); // Simpan harga saat transaksi
            $table->decimal('subtotal', 15, 2); // qty * price
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Hapus detail dulu karena dia punya foreign key ke header
        Schema::dropIfExists('product_order_items');
        Schema::dropIfExists('product_orders');
    }
};