<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UserLoginRequest extends FormRequest
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
            'phone'    => ['required', 'max:15'],
            'password' => ['required', 'min:5', 'max:10'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.required'    => 'Phone wajib diisi!',
            'phone.max'         => 'Phone tidak boleh lebih dari 15 karakter!',
            'password.required' => 'Password wajib diisi!',
            'password.min'      => 'Password minimal harus memiliki 5 karakter!',
            'password.max'      => 'Password tidak boleh lebih dari 10 karakter!',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response([
            "errors" => $validator->getMessageBag()
        ], 422));
    }
}
