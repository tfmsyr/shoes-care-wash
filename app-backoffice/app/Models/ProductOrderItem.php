<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_order_id',
        'product_id',
        'qty',
        'price',
        'subtotal',
    ];

    /**
     * Relasi: Item ini dimiliki oleh sebuah Order
     */
    public function order()
    {
        return $this->belongsTo(ProductOrder::class, 'product_order_id');
    }

    /**
     * Relasi: Item ini merujuk ke satu Produk Master
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}