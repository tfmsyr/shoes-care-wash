<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'logo'                    => $this->logo,
            'name'                    => $this->name,
            'address'                 => $this->address,
            'phone'                   => $this->phone,
            'email'                   => $this->email,
            'timezone'                => $this->timezone,
            'status'                  => $this->status,
            'created_at'              => $this->created_at,
            'updated_at'              => $this->updated_at,
        ];
    }
}
