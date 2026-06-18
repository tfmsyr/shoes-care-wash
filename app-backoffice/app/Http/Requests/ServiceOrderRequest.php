<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ServiceOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Pastikan ini true agar request tidak ditolak
        return true; 
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Header Data
            'order_number' => ['nullable', 'string', 'max:50'],
            'customer_id'  => ['required', 'integer', 'exists:customers,id'],
            'discount'     => ['nullable', 'numeric', 'min:0', 'max:100'], 
            'status'       => ['required', 'string', 'in:received,in_progress,completed,cancelled'],
            'notes'        => ['nullable', 'string', 'max:500'],

            // Multi-Service Items (Validation for Array)
            'items'              => ['required', 'array', 'min:1'],
            'items.*.service_id' => ['required', 'integer', 'exists:services,id'],
            'items.*.price'      => ['required', 'numeric', 'min:0'],
            'items.*.qty'        => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * Custom pesan error dalam Bahasa Indonesia
     */
    public function messages(): array
    {
        return [
            'customer_id.required' => 'Customer wajib dipilih.',
            'customer_id.exists'   => 'Customer yang dipilih tidak terdaftar di sistem.',
            
            'items.required'       => 'Minimal harus ada 1 layanan yang dipilih.',
            'items.array'          => 'Format data layanan tidak valid.',
            'items.min'            => 'Pilih minimal satu layanan sebelum menyimpan.',
            
            'items.*.service_id.required' => 'ID Layanan wajib diisi.',
            'items.*.service_id.exists'   => 'Salah satu layanan tidak ditemukan di database.',
            'items.*.price.required'      => 'Harga layanan tidak boleh kosong.',
            'items.*.qty.required'        => 'Jumlah (qty) wajib diisi.',
            'items.*.qty.min'             => 'Jumlah minimal adalah 1.',

            'discount.max'         => 'Diskon maksimal adalah 100%.',
            'status.in'            => 'Status yang dipilih tidak valid.',
            'status.required'      => 'Status pesanan wajib diisi.',
        ];
    }
}