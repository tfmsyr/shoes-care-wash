<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'company'    => $this->whenLoaded('company', function () {
                return [
                    'id'    => $this->company->id,
                    'name'  => $this->company->name,
                ];
            }),
            'photo'      => $this->photo,
            'nik'        => $this->nik,
            'name'       => $this->name,
            'email'      => $this->email,
            'phone'      => $this->phone,
            'token'      => $this->whenNotNull($this->token),
            'role'       => $this->whenLoaded('role', function () {
                return [
                    'id'    => $this->role->id,
                    'name'  => $this->role->name,
                ];
            }),
            'status'     => $this->status,
            'permissions' => $this->whenLoaded('role', function () {
                return $this->role->permissions->map(function ($permission) {
                    return [
                        'name' => $permission->name,
                        'slug' => $permission->slug,
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
