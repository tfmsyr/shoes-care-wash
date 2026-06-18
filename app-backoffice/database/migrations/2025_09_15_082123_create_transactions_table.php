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
    Schema::create('transactions', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('company_id')->nullable();
        $table->decimal('amount', 15, 2);
        $table->string('currency', 5)->default('IDR');
        $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
        $table->timestamp('paid_at')->nullable();
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('transactions');
}

};