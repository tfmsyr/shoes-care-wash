<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceCategory extends Model
{
    use SoftDeletes;
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function services()
    {
        return $this->hasMany(Service::class, 'category_id');
    }
}
