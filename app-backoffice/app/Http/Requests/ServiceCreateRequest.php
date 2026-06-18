<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ServiceCreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() != null;
    }

    /**
     * Menyiapkan data sebelum proses validasi berjalan.
     * Di sini kita menyisipkan company_id dari user yang sedang login secara otomatis.
     */
    protected function prepareForValidation()
    {
        if ($this->user()) {
            $this->merge([
                // Asumsi field di tabel users adalah 'company_id'
                // Sesuaikan jika nama field relasinya berbeda
                'company_id' => $this->user()->company_id, 
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'company_id'          => ['required','integer','exists:companies,id'],
            'name'                => ['required', 'max:200'],
            'code'                => ['required', 'max:100', Rule::unique('services', 'code')->where('company_id', $this->company_id)->whereNull('deleted_at')],
            'category_id'         => ['required', 'integer', 'exists:service_categories,id'],
            'price'               => ['required', 'integer'],
            'discount'            => ['nullable', 'integer'],
            'photo'               => ['nullable', 'file', 'mimes:jpeg,png,jpg', 'max:2048'], // 2 MB = 2048 KB
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required'     => 'Perusahaan wajib diisi.',
            'company_id.exists'       => 'Perusahaan tidak ditemukan.',
            'name.required'           => 'Nama layanan wajib diisi.',
            'code.required'           => 'Kode layanan wajib diisi.',
            'code.unique'             => 'Kode layanan sudah digunakan.',
            'category_id.required'    => 'Kategori wajib diisi.',
            'category_id.exists'      => 'Kategori tidak ditemukan.',
            'price.required'          => 'Harga jual wajib diisi.',
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