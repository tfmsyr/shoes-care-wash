<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
class CompanyUpdateManageRequest extends FormRequest
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
            'name'                      => ['required', 'max:200'],
            'phone'                     => ['required', 'max:100'],
            'email'                     => ['required', 'max:100'],
            'address'                   => ['required'],
            'timezone'                  => ['required', 'in:WIB,WITA,WIT'],
            'logo'                      => ['nullable', 'file', 'mimes:jpeg,png,jpg', 'max:2048'], // 2 MB = 2048 KB
        ];
    }

    public function messages(): array
    {
        return [

            'name.required'        => 'Nama perusahaan wajib diisi.',
            'name.max'             => 'Nama perusahaan maksimal :max karakter.',

            'phone.required'       => 'Nomor telepon wajib diisi.',
            'phone.max'            => 'Nomor telepon maksimal :max karakter.',

            'email.required'       => 'Email wajib diisi.',
            'email.max'            => 'Email maksimal :max karakter.',

            'address.required'     => 'Alamat perusahaan wajib diisi.',

            'timezone.required'    => 'Zona waktu wajib diisi.',
            'timezone.in'          => 'Zona waktu harus salah satu dari: WIB, WITA, atau WIT.',

            'logo.file'           => 'Logo harus berupa file.',
            'logo.mimes'          => 'Logo harus berformat jpeg, png, atau jpg.',
            'logo.max'            => 'Ukuran logo maksimal 2 MB.',
        ];
    }


    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response([
            "errors" => $validator->getMessageBag()
        ], 422));
    }
}
