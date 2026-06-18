<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ProfilUpdateRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'  => ['required', 'max:100'],
            'email' => ['nullable', 'email'],
            'nik'   => ['required', Rule::unique('users', 'nik')->whereNull('deleted_at')->ignore($this->user()->id)],
            'phone' => ['required','regex:/^08[0-9]{8,11}$/',Rule::unique('users', 'phone')->whereNull('deleted_at')->ignore($this->user()->id)],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'     => 'Nama wajib diisi!',
            'nik.required'      => 'NIK wajib diisi!',
            'nik.unique'        => 'NIK sudah terdaftar.',
            'phone.required'   => 'Nomor whatsapp wajib diisi!',
            'phone.regex'       => 'Nomor whatsapp harus diawali dengan 08 dan hanya angka.',
            'phone.unique'      => 'Nomor whatsapp sudah terdaftar.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response([
            "errors" => $validator->getMessageBag()
        ], 422));
    }
}
