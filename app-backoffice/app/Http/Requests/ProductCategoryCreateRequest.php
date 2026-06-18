<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ProductCategoryCreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() != null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
   public function rules(): array
    {
        return [
            // HAPUS validasi 'company_id' dari sini karena kita tidak butuh input dari user lagi
            'name' => [
                'required',
                'max:100',
                // Ambil company_id langsung dari user yang sedang login untuk cek unique-nya
                Rule::unique('product_categories', 'name')
                    ->where('company_id', $this->user()->company_id) 
                    ->whereNull('deleted_at')
            ],
            'description' => ['nullable']
        ];
    }

    public function messages(): array
    {
        return [
            // Hapus semua pesan error terkait company_id
            'name.required' => 'Nama kategori wajib diisi.',
            'name.max'      => 'Nama kategori tidak boleh lebih dari :max karakter.',
            'name.unique'   => 'Nama kategori sudah digunakan dalam perusahaan ini.',
        ];
    }
}