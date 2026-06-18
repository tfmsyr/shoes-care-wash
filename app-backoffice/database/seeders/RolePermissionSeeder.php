<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use DB;
class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('rolepermissions')->insert([
            [
                'id'            => 1,
                'role_id'       => 3,
                'permission_id' => 1,
                'created_at'    => now(),
                'updated_at'    => now()
            ],
            [
                'id'            => 2,
                'role_id'       => 3,
                'permission_id' => 2,
                'created_at'    => now(),
                'updated_at'    => now()
            ],
            [
                'id'            => 3,
                'role_id'       => 4,
                'permission_id' => 2,
                'created_at'    => now(),
                'updated_at'    => now()
            ],
        ]);
    }
}
