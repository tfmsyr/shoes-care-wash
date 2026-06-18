<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ProductCreateRequest extends FormRequest
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
     */
    public function rules(): array
    {
        // AMAN: Ambil company_id langsung dari token user yang login
        $companyId = $this->user()->company_id;

        return [
            // 'company_id' DIHAPUS dari validasi karena sudah tidak dikirim user
            'name'           => ['required', 'string', 'max:200'],
            'code'           => [
                'required', 
                'max:100', 
                Rule::unique('products', 'code')
                    ->where('company_id', $companyId) // Gunakan $companyId dari user
                    ->whereNull('deleted_at')
            ],
            'barcode'        => [
                'nullable',
                'max:100',
                Rule::unique('products', 'barcode')
                    ->where('company_id', $companyId) // Gunakan $companyId dari user
                    ->whereNull('deleted_at'),
            ],
            'category_id'    => [
                'required', 
                'integer', 
                Rule::exists('product_categories', 'id')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId) // Gunakan $companyId dari user
                                 ->whereNull('deleted_at');
                }),
            ],
            'unit'           => ['nullable', 'string'],
            'purchase_price' => ['required', 'integer'],
            'selling_price'  => ['required', 'integer'],
            'discount'       => ['nullable', 'integer'],
            'description'    => ['nullable', 'string'],
            'stock'          => ['nullable', 'integer'],
            'photo'          => ['nullable', 'file', 'mimes:jpeg,png,jpg', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            // Pesan error company_id dihapus agar lebih bersih
            'name.required'           => 'Nama produk wajib diisi.',
            'code.required'           => 'Kode produk wajib diisi.',
            'code.unique'             => 'Kode produk sudah digunakan.',
            'barcode.unique'          => 'Barcode sudah digunakan.',
            'category_id.required'    => 'Kategori wajib diisi.',
            'category_id.exists'      => 'Kategori tidak ditemukan atau bukan milik perusahaan Anda.',
            'purchase_price.required' => 'Harga beli wajib diisi.',
            'selling_price.required'  => 'Harga jual wajib diisi.',
            'photo.file'              => 'File photo harus berupa file.',
            'photo.mimes'             => 'Format file photo harus jpeg, jpg, atau png.',
            'photo.max'               => 'Ukuran file photo maksimal 2MB.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response([
            "errors" => $validator->getMessageBag()
        ], 422));
    }
}