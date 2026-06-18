<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use DB;
class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('permissions')->insert([
            [
                'id'        => 1,
                'name'      => 'Staff',
                'slug'      => 'users.menu',
                'created_at'=> now(),
                'updated_at'=> now()
            ],[
                'id'        => 2,
                'name'      => 'Customer',
                'slug'      => 'customer.menu',
                'created_at'=> now(),
                'updated_at'=> now()
            ]
        ]);
    }
}
