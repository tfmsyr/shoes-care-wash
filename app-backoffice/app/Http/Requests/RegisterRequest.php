<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'business_name'       => ['required', 'max:200'],
            'business_address'    => ['required', 'max:200'],
            'name'                => ['required', 'max:200'],
            // 'email'               => ['required', 'email', 'max:100', Rule::unique('users', 'email')->whereNull('deleted_at')],
            'phone'               => ['required', 'regex:/^08[0-9]{8,11}$/', Rule::unique('users', 'phone')->whereNull('deleted_at')],
            'password'            => ['required', 'min:8', 'max:10']
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'business_name.required' => 'Nama bisnis wajib diisi.',
            'business_name.max' => 'Nama bisnis tidak boleh lebih dari 200 karakter.',
            'business_address.required' => 'Alamat bisnis wajib diisi.',
            'business_address.max' => 'Alamat bisnis tidak boleh lebih dari 200 karakter.',
            'name.required' => 'Nama wajib diisi.',
            'name.max' => 'Nama tidak boleh lebih dari 200 karakter.',
            // 'email.required' => 'Email wajib diisi.',
            // 'email.email' => 'Format email tidak valid.',
            // 'email.max' => 'Email tidak boleh lebih dari 100 karakter.',
            // 'email.unique' => 'Email sudah terdaftar.',
            'phone.required' => 'Nomor whatsapp wajib diisi!',
            'phone.regex'    => 'Nomor whatsapp harus diawali dengan 08 dan hanya angka.',
            'phone.unique' => 'Nomor whatsapp sudah terdaftar.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal harus 5 karakter.',
            'password.max' => 'Kata sandi tidak boleh lebih dari 10 karakter.',
        ];
    }


    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response([
            "errors" => $validator->getMessageBag()
        ], 422));
    }
}
