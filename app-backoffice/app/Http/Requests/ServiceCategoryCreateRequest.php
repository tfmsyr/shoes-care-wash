<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ServiceCategoryCreateRequest extends FormRequest
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
            // 1. Aturan 'company_id' DIHAPUS dari sini karena sudah diurus oleh Controller
            
            'name' => [
                'required',
                'max:100',
                Rule::unique('service_categories', 'name')
                    // 2. Ubah $this->company_id menjadi $this->user()->company_id
                    ->where('company_id', $this->user()->company_id) 
                    ->whereNull('deleted_at')
            ],
            'description' => ['nullable']
        ];
    }

    public function messages(): array
    {
        return [
            // Pesan error company_id dihapus agar lebih bersih
            'name.required' => 'Nama kategori wajib diisi.',
            'name.max'      => 'Nama kategori tidak boleh lebih dari :max karakter.',
            'name.unique'   => 'Nama kategori sudah digunakan dalam perusahaan ini.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response([
            "errors" => $validator->getMessageBag()
        ], 422));
    }
}