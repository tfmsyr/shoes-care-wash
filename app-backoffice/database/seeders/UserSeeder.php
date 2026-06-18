<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use DB;
use Hash;
class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'id'        => 1,
                'company_id'=> 1,
                'name'      => fake()->name(),
                'phone'     => fake()->numerify('08##########'),
                'email'     => fake()->unique()->safeEmail(),
                'password'  => Hash::make('password'),
                'role_id'   => 3,
                'status'    => 1,
                'created_at'=> now(),
                'updated_at'=> now()
            ],[
                'id'        => 2,
                'company_id'=> 1,
                'name'      => fake()->name(),
                'phone'     => fake()->numerify('08##########'),
                'email'     => fake()->unique()->safeEmail(),
                'password'  => Hash::make('password'),
                'role_id'   => 4,
                'status'    => 1,
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'id'        => 3,
                'company_id'=> 2,
                'name'      => fake()->name(),
                'phone'     => fake()->numerify('08##########'),
                'email'     => fake()->unique()->safeEmail(),
                'password'  => Hash::make('password'),
                'role_id'   => 2,
                'status'    => 1,
                'created_at'=> now(),
                'updated_at'=> now()
            ]
        ]);
    }
}
