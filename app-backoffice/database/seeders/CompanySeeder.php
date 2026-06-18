<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use DB;
class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('companies')->insert([
            [
                'id'        => 1,
                'name'      => 'VRAS',
                'email'     => 'info@vrasmedia.com',
                'phone'     => fake()->numerify('08##########'),
                'address'   => 'Semarang',
                'status'    => 1,
                'created_at'=> now(),
                'updated_at'=> now()
            ],[
                'id'        => 2,
                'name'      => 'Kost Kuning',
                'email'     => 'kostkuning@gmail.com',
                'phone'     => fake()->numerify('08##########'),
                'address'   => 'Pekalongan',
                'status'    => 1,
                'created_at'=> now(),
                'updated_at'=> now()
            ]
        ]);
    }
}
