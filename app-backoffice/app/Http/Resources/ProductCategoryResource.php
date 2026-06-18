<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductCategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'company'   => $this->whenLoaded('company', function () {
                return [
                    'id'    => $this->company->id,
                    'name'  => $this->company->name,
                    'timezone'  => $this->company->timezone,
                ];
            }),
            'name'      => $this->name,
            'description'      => $this->description,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

}
