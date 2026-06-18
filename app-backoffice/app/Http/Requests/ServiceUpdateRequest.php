<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
class ServiceUpdateRequest extends FormRequest
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
            'name'                => ['required', 'max:200'],
            'code'                => ['required', 'max:100', Rule::unique('services', 'code')->where('company_id', $this->user()->company_id)->whereNull('deleted_at')->ignore($this->route('id'))],
            'category_id'         => ['required', 'integer', 'exists:service_categories,id'],
            'price'               => ['required', 'integer'],
            'discount'            => ['nullable', 'integer'],
            'photo'               => ['nullable', 'file', 'mimes:jpeg,png,jpg', 'max:2048'], // 2 MB = 2048 KB
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'           => 'Nama layanan wajib diisi.',
            'code.required'           => 'Kode layanan wajib diisi.',
            'code.unique'             => 'Kode layanan sudah digunakan.',
            'category_id.required'    => 'Kategori wajib diisi.',
            'category_id.exists'      => 'Kategori tidak ditemukan.',
            'price.required'          => 'Harga wajib diisi.',
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
