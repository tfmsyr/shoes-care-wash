<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
class CustomerUpdateRequest extends FormRequest
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
            'phone'               => ['required', 'regex:/^08[0-9]{8,11}$/','max:13', Rule::unique('customers', 'phone')->whereNull('deleted_at')->ignore($this->route('id'))],
            'address'             => ['nullable']
        ];
    }

    public function messages(): array
    {
        return [
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
