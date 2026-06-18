<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ExpenseCategoryCreateRequest extends FormRequest
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
            'company_id'         => ['required','integer','exists:companies,id'],
            'name' => [
                'required',
                'max:100',
                Rule::unique('expense_categories', 'name')
                    ->where('company_id', $this->company_id)
                    ->whereNull('deleted_at')
            ],
            'description' => ['nullable']
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => 'Perusahaan wajib diisi.',
            'company_id.integer'  => 'Perusahaan harus berupa angka.',
            'company_id.exists'   => 'Perusahaan tidak ditemukan di database.',

            'name.required' => 'Nama kategori wajib diisi.',
            'name.max'      => 'Nama kategori tidak boleh lebih dari :max karakter.',
            'name.unique'   => 'Nama kategori sudah digunakan dalam perusahaan ini.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response([
            "errors" => $validator->getMessageBag()
        ], 422));
    }
}
