<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use DB;
class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('roles')->insert([
            [
                'id'        => 3,
                'name'      => 'Owner',
                'created_at'=> now(),
                'updated_at'=> now()
            ],[
                'id'        => 4,
                'name'      => 'Staff',
                'created_at'=> now(),
                'updated_at'=> now()
            ]
        ]);
    }
}
