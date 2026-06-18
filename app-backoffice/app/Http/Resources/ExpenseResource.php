<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // === PERBAIKAN URL GAMBAR (PROOF) ===
        $proofUrl = $this->proof;
        
        // Jika proof ada isinya, tapi TIDAK memiliki awalan http:// atau https://
        if ($proofUrl && !preg_match("~^(?:f|ht)tps?://~i", $proofUrl)) {
            // Maka gabungkan dengan Base URL penyimpanan kamu
            $proofUrl = 'https://is3.cloudhost.id/vras/shoescare/' . ltrim($proofUrl, '/');
        }

        // Jika proof benar-benar kosong di database, tampilkan gambar default
        if (!$proofUrl) {
            $proofUrl = 'https://is3.cloudhost.id/vras/shoescare/expenses/no_img.png';
        }
        // ====================================

        return [
            'id'            => $this->id,
            'company'       => $this->whenLoaded('company', function () {
                return [
                    'id'       => $this->company->id,
                    'name'     => $this->company->name,
                    'timezone' => $this->company->timezone,
                ];
            }),
            'proof'         => $proofUrl, // <-- Gunakan variabel URL yang sudah diformat di atas
            'date'          => $this->date,
            'name'          => $this->name,
            'amount'        => $this->amount,
            'description'   => $this->description,
            'category'      => $this->whenLoaded('category', function () {
                return [
                    'id'   => $this->category->id,
                    'name' => $this->category->name,
                ];
            }),
            'created_at'    => $this->created_at,
            'updated_at'    => $this->updated_at,
        ];
    }
}