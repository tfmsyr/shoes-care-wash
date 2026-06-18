<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class CustomerCreateRequest extends FormRequest
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
            'company_id'          => ['required','integer','exists:companies,id'],
            'name'                => ['required', 'max:200'],
            'phone'               => ['required', 'regex:/^08[0-9]{8,11}$/', 'max:13', Rule::unique('customers', 'phone')->whereNull('deleted_at')],
            'address'             => ['nullable']
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => 'Perusahaan wajib diisi.',
            'company_id.integer'  => 'Perusahaan harus berupa angka.',
            'company_id.exists'   => 'Perusahaan tidak ditemukan di database.',
            'name.required'       => 'Nama wajib diisi.',
            'name.max'            => 'Nama tidak boleh lebih dari 200 karakter.',
            'phone.required'      => 'Nomor whatsapp wajib diisi!',
            'phone.regex'         => 'Nomor whatsapp harus diawali dengan 08 dan hanya angka.',
            'phone.unique'        => 'Nomor Whatsapp sudah terdaftar.'
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response([
            "errors" => $validator->getMessageBag()
        ], 422));
    }
}
