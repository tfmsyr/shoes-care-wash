<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    // Daftarkan semua kolom yang boleh diisi datanya
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'timezone', // ⬅️ Kolom baru yang baru saja kita buat
        'logo',
        'referral_code',
        'registration_code',
        'code',
        'show_web',
        'outlet',
        'date_payment_next',
        'payment_type',
        'payment_value',
        'api_key',
        'status'
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'company_id');
    }
}