<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'company'   => $this->whenLoaded('company', function () {
                return [
                    'id'    => $this->company->id,
                    'name'  => $this->company->name,
                    'timezone'  => $this->company->timezone,
                ];
            }),
            'photo'         => $this->photo,
            'code'          => $this->code,
            'name'          => $this->name,
            'barcode'       => $this->barcode,
            'purchase_price'=> $this->purchase_price,
            'selling_price' => $this->selling_price,
            'discount'      => $this->discount,
            'description'   => $this->description,
            'stock'         => $this->stock,
            'unit'          => $this->unit,
            'status'        => $this->status,
            'category'      => $this->whenLoaded('category', function () {
                return [
                    'id'    => $this->category->id,
                    'name'  => $this->category->name,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
