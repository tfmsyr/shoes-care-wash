<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UserCreateRequest extends FormRequest
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
            'nik'                 => ['required', 'max:100', Rule::unique('users', 'nik')->whereNull('deleted_at')],
            'email'               => ['nullable', 'email', Rule::unique('users', 'email')->whereNull('deleted_at')],
            'phone'               => ['required', 'regex:/^08[0-9]{8,11}$/', 'max:13', Rule::unique('users', 'phone')->whereNull('deleted_at')],
            'password'            => ['required', 'min:8', 'max:10']
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
            'nik.required'        => 'NIK wajib diisi.',
            'nik.unique'          => 'NIK sudah terdaftar.',
            'email.email'         => 'Format email tidak valid.',
            'email.unique'        => 'Email sudah terdaftar.',
            'phone.required'      => 'Nomor whatsapp wajib diisi!',
            'phone.regex'         => 'Nomor whatsapp harus diawali dengan 08 dan hanya angka.',
            'phone.unique'        => 'Nomor Whatsapp sudah terdaftar.',
            'password.min'        => 'Password minimal 8 karakter.',
            'password.max'        => 'Password tidak boleh lebih dari 10 karakter.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response([
            "errors" => $validator->getMessageBag()
        ], 422));
    }
}
