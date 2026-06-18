<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ExpenseCreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Pastikan user login
        return $this->user() != null;
    }

    /**
     * Menyiapkan data sebelum proses validasi berjalan.
     * INI ADALAH SOLUSINYA: Kita otomatis ambil company_id dari user yang login.
     */
    protected function prepareForValidation()
    {
        if ($this->user()) {
            $this->merge([
                // Asumsi di tabel users kamu ada kolom 'company_id'
                // Jika berbeda, sesuaikan dengan relasi kamu, misal: $this->user()->profile->company_id
                'company_id' => $this->user()->company_id, 
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'company_id' => [
                'required',
                'integer',
                // Pastikan company_id memang ada
                'exists:companies,id' 
            ],
            
            'name' => ['required', 'string', 'max:200'],
            'date' => ['required', 'date'],
            
            'category_id' => [
                'required', 
                'integer', 
                // Pastikan kategori ini benar-benar MILIK perusahaan yang sedang diinput
                Rule::exists('expense_categories', 'id')->where(function ($query) {
                    return $query->where('company_id', $this->input('company_id'));
                }),
            ],
            
            'amount' => ['required', 'numeric', 'min:0'],
            
            'description' => ['nullable', 'string'],
            'proof' => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:2048'], 
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required'     => 'Perusahaan wajib diisi.',
            'company_id.exists'       => 'Perusahaan tidak valid atau tidak ditemukan.',
            'name.required'           => 'Nama pengeluaran wajib diisi.',
            'date.required'           => 'Tanggal wajib diisi.',
            'category_id.required'    => 'Kategori wajib diisi.',
            'category_id.exists'      => 'Kategori tidak ditemukan atau bukan milik perusahaan ini.',
            'amount.required'         => 'Nominal wajib diisi.',
            'amount.min'              => 'Nominal tidak boleh bernilai minus.',
            'proof.file'              => 'File Receipt harus berupa file.',
            'proof.mimes'             => 'Format file Receipt harus jpeg, jpg, pdf, atau png.',
            'proof.max'               => 'Ukuran file Receipt maksimal 2MB.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response([
            "errors" => $validator->getMessageBag()
        ], 422));
    }
}