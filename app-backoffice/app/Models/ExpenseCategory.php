<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExpenseCategory extends Model
{
    use SoftDeletes;
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function expenses()
    { 
        return $this->hasMany(Expense::class, 'category_id');
    }
}
