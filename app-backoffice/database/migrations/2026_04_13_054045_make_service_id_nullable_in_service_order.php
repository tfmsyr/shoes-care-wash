<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_order', function (Blueprint $table) {
            // Mengubah kolom service_id agar boleh kosong (NULL)
            $table->foreignId('service_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('service_order', function (Blueprint $table) {
            $table->foreignId('service_id')->nullable(false)->change();
        });
    }
};