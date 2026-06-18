<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceOrderDetail extends Model
{
    protected $table = 'service_order_details';

    protected $fillable = [
        'service_order_id',
        'service_id',
        'quantity',
        'price',
    ];

    // Relasi ke tabel induk
    public function order()
    {
        return $this->belongsTo(ServiceOrder::class, 'service_order_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Accessor untuk menghitung subtotal otomatis
     */
    public function getSubtotalAttribute()
    {
        return $this->quantity * $this->price;
    }

    /**
     * Tambahkan subtotal ke setiap response API
     */
    protected $appends = ['subtotal'];
}