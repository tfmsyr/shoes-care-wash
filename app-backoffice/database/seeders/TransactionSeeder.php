<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
   public function run(): void
{
    \DB::table('transactions')->insert([
        [
            'company_id' => 1,
            'amount' => 250000,
            'currency' => 'IDR',
            'status' => 'paid',
            'paid_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'company_id' => 1,
            'amount' => 700000,
            'currency' => 'IDR',
            'status' => 'paid',
            'paid_at' => now()->subDays(3),
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'company_id' => 1,
            'amount' => 5000000,
            'currency' => 'IDR',
            'status' => 'paid',
            'paid_at' => now()->subMonth(),
            'created_at' => now(),
            'updated_at' => now(),
        ]
    ]);
}
}