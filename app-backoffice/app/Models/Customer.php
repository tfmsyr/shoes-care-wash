<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    // INI KUNCINYA Ndan: Daftarin kolom apa aja yang boleh diisi dari form
    protected $fillable = [
        'company_id',
        'name',
        'phone',
        'email',
        'address'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}