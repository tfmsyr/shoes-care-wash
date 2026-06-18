<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_number' => 'required|string|max:255',
            'status' => 'required|string|in:received,processing,completed,cancelled',
            'customer_name' => 'required|string|max:255',
            'whatsapp_number' => 'required|string|max:50',
            'subtotal' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'nullable|numeric|min:0',
            'items.*.subtotal' => 'nullable|numeric|min:0',
        ];
    }
}
