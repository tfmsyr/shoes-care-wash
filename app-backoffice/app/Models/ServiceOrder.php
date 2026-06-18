<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceOrder extends Model
{
    use HasFactory;

    protected $table = 'service_order';

    protected $fillable = [
        'order_number', // Tambahkan ini bray!
        'company_id',
        'customer_id',
        'service_id',   // Biarkan ini, tapi nanti diisi NULL
        'discount',
        'status',
        'notes',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Relasi ke ServiceOrderDetail (Multiple Items)
     */
    public function details()
    {
        return $this->hasMany(ServiceOrderDetail::class, 'service_order_id', 'id');
    }
}