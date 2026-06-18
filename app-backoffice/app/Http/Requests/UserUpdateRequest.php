<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
class UserUpdateRequest extends FormRequest
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
            'nik'                 => ['nullable', 'max:100', Rule::unique('users', 'nik')->whereNull('deleted_at')->ignore($this->route('id'))],
            'email'               => ['nullable', 'email', Rule::unique('users', 'email')->whereNull('deleted_at')->ignore($this->route('id'))],
            'phone'               => ['required', 'regex:/^08[0-9]{8,11}$/','max:13', Rule::unique('users', 'phone')->whereNull('deleted_at')->ignore($this->route('id'))],
            'password'            => ['nullable', 'min:8','max:10']
        ];
    }

    public function messages(): array
    {
        return [
            'nik.required'        => 'NIK wajib diisi.',
            'nik.unique'          => 'NIK sudah terdaftar.',
            'name.required'       => 'Nama wajib diisi.',
            'name.max'            => 'Nama tidak boleh lebih dari 200 karakter.',
            'email.email'         => 'Format email tidak valid.',
            'email.unique'        => 'Email sudah terdaftar.',
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
