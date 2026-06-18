<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UserChangePasswordRequest extends FormRequest
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
            'old_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:6', 'different:old_password'],
            'confirm_password' => ['required', 'same:new_password'],
        ];
    }

    public function messages(): array
    {
        return [
            'old_password.required'       => 'Password lama wajib diisi.',
            'new_password.required'       => 'Password baru wajib diisi.',
            'new_password.min'            => 'Password baru minimal harus terdiri dari :min karakter.',
            'new_password.different'      => 'Password baru harus berbeda dengan password lama.',
            'confirm_password.required'   => 'Konfirmasi password wajib diisi.',
            'confirm_password.same'       => 'Konfirmasi password tidak cocok dengan password baru.',
        ];
    }


    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response([
            "errors" => $validator->getMessageBag()
        ], 422));
    }
}
