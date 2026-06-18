<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
class ExpenseUpdateRequest extends FormRequest
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
            'date'                => ['required', 'date'],
            'category_id'         => ['required', 'integer', 'exists:expense_categories,id'],
            'amount'              => ['required', 'integer'],
            'description'         => ['nullable'],
            'proof'               => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:2048'], // 2 MB = 2048 KB
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'           => 'Nama pengeluaran wajib diisi.',
            'date.required'           => 'Tanggal wajib diisi.',
            'category_id.required'    => 'Kategori wajib diisi.',
            'category_id.exists'      => 'Kategori tidak ditemukan.',
            'amount.required'         => 'Nominal wajib diisi.',
            'proof.file'              => 'File receipt harus berupa file.',
            'proof.mimes'             => 'Format file receipt harus jpeg, jpg,pdf atau png.',
            'proof.max'               => 'Ukuran file receipt maksimal 2MB.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response([
            "errors" => $validator->getMessageBag()
        ], 422));
    }
}
