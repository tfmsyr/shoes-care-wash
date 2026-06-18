<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $table = 'services';
    protected $primaryKey = 'id';
    protected $keyType = 'int';
    public $incrementing = true;
    public $timestamps = true;

    // TAMBAHKAN 'company_id' DI SINI
    protected $fillable = [
        'company_id', 
        'photo',
        'category_id',
        'code',
        'name',
        'description',
        'price',
        'discount',
        'status'
    ];

    public function category()
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id', 'id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id', 'id');
    }
}
