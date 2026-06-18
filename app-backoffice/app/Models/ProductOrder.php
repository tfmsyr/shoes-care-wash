<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductOrder extends Model
{
    use HasFactory;

    // Kolom yang boleh diisi mass-assignment
    protected $fillable = [
        'company_id',
        'order_number',
        'status',
        'customer_name',
        'whatsapp_number',
        'subtotal',
        'discount_amount',
        'total_amount',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'discount_amount' => 'float',
        'total_amount' => 'float',
    ];

    /**
     * Relasi: Satu Order memiliki banyak Item (Daftar Produk)
     */
    public function items()
    {
        return $this->hasMany(ProductOrderItem::class, 'product_order_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
