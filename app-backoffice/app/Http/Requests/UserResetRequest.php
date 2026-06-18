<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UserResetRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'phone'    => ['required', 'regex:/^08[0-9]{8,11}$/'],
            'otp_code' => ['required', 'digits:4'],
            'password' => ['required', 'min:8', 'max:10'],
            'password_confirm' => ['required', 'same:password'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.required' => 'Nomor whatsapp wajib diisi!',
            'phone.regex'    => 'Nomor whatsapp harus diawali dengan 08 dan hanya angka.',
            'otp_code.required' => 'Kode OTP wajib diisi!',
            'otp_code.digits'   => 'Kode OTP harus terdiri dari 4 digit angka!',
            'password.required'     => 'Password wajib diisi!',
            'password.min'          => 'Password minimal harus memiliki 8 karakter!',
            'password.max'          => 'Password tidak boleh lebih dari 10 karakter!',
            
            'password_confirm.required' => 'Konfirmasi password wajib diisi!',
            'password_confirm.same'     => 'Konfirmasi password harus sama dengan password!',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response([
            "errors" => $validator->getMessageBag()
        ], 422));
    }
}
