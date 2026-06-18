<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfilController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ServiceCategoryController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ServiceOrderController; 
use App\Http\Controllers\ProductOrderController;
use App\Http\Controllers\ReportController;

Route::prefix('v1/app/')->group(function () {
    Route::controller(AuthController::class)->group(function () {
        Route::post('auth/login', 'login');
        Route::post('auth/register', 'register');
        Route::post('auth/forgot-password','requestOtp');
        Route::post('auth/verify-otp','verifyOtp');
        Route::post('auth/reset-password', 'resetPassword');
    });
});

Route::middleware(['auth:sanctum'])->prefix('v1/app/')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'getDashboardData']);
    Route::get('report', [ReportController::class, 'index']);
    
    Route::controller(ProfilController::class)->group(function () {
        Route::get('profile', 'get');
        Route::post('profile/update', 'update');
        Route::post('profile/change-photo', 'changePhoto');
        Route::post('profile/change-password', 'changePassword');
    });

    Route::controller(CompanyController::class)->group(function () {
        Route::get('companies/manage', 'manage');
        Route::post('companies/manage', 'updateManage');
    });

    Route::controller(UserController::class)->group(function () {
        Route::get('users', 'search');
        Route::get('users/all', 'all');
        Route::get('users/{id}', 'get')->where('id', '[0-9]+');
        Route::delete('users/{id}', 'delete')->where('id', '[0-9]+');
        Route::post('users', 'create');
        Route::post('users/{id}', 'update')->where('id', '[0-9]+');
        Route::get('users/export', 'export');
        Route::delete('users', 'deleteMultiple');
    });


    Route::controller(CustomerController::class)->group(function () {
            Route::get('customers', 'search');
            Route::get('customers/all', 'all');
            Route::get('customers/{id}', 'get')->where('id', '[0-9]+');
            Route::delete('customers/{id}', 'delete')->where('id', '[0-9]+');
            Route::post('customers', 'create');
            Route::post('customers/{id}', 'update')->where('id', '[0-9]+');
            Route::get('customers/export', 'export');
            Route::delete('customers', 'deleteMultiple');
        });

    Route::controller(ServiceCategoryController::class)->group(function () {
        Route::get('service-categories', 'search');
        Route::get('service-categories/all', 'all');
        Route::get('service-categories/{id}', 'get')->where('id', '[0-9]+');
        Route::delete('service-categories/{id}', 'delete')->where('id', '[0-9]+');
        Route::post('service-categories', 'create');
        Route::post('service-categories/{id}', 'update')->where('id', '[0-9]+');
        Route::delete('service-categories', 'deleteMultiple');
    });

    Route::controller(ServiceController::class)->group(function () {
        Route::get('services', 'search');
        Route::get('services/all', 'all');
        Route::get('services/{id}', 'get')->where('id', '[0-9]+');
        Route::delete('services/{id}', 'delete')->where('id', '[0-9]+');
        Route::post('services', 'create');
        Route::put('services/{id}', 'update')->where('id', '[0-9]+');
        Route::get('services/export', 'export');
    });

    Route::controller(ProductOrderController::class)->group(function () {
        Route::get('product-orders', 'search'); // Mengikuti pola controller kamu (search)
        Route::get('product-orders/all', 'all');
        Route::get('product-orders/{id}', 'get')->where('id', '[0-9]+');
        Route::post('product-orders', 'create');
        Route::post('product-orders/{id}', 'update')->where('id', '[0-9]+');
        Route::delete('product-orders/{id}', 'delete')->where('id', '[0-9]+');
        Route::get('product-orders/export', 'export');
    });

    Route::controller(ServiceOrderController::class)->group(function () {
        Route::get('service-orders', 'index');
        Route::get('service-orders/{serviceOrder}', 'show')->where('serviceOrder', '[0-9]+');
        Route::post('service-orders', 'store');
        Route::put('service-orders/{serviceOrder}', 'update')->where('serviceOrder', '[0-9]+');
        Route::delete('service-orders/{serviceOrder}', 'destroy')->where('serviceOrder', '[0-9]+');
    });
    // --- AKHIR TAMBAHAN BLOK ---

    Route::controller(ProductCategoryController::class)->group(function () {
        Route::get('product-categories', 'search');
        Route::get('product-categories/all', 'all');
        Route::get('product-categories/{id}', 'get')->where('id', '[0-9]+');
        Route::delete('product-categories/{id}', 'delete')->where('id', '[0-9]+');
        Route::post('product-categories', 'create');
        Route::post('product-categories/{id}', 'update')->where('id', '[0-9]+');
        Route::delete('product-categories', 'deleteMultiple');
    });

    Route::controller(ProductController::class)->group(function () {
        Route::get('products', 'search');
        Route::get('products/all', 'all');
        Route::get('products/{id}', 'get')->where('id', '[0-9]+');
        Route::delete('products/{id}', 'delete')->where('id', '[0-9]+');
        Route::post('products', 'create');
        Route::post('products/{id}', 'update')->where('id', '[0-9]+');
        Route::get('products/export', 'export');
    });


    Route::controller(ExpenseCategoryController::class)->group(function () {
        Route::get('expense-categories', 'search');
        Route::get('expense-categories/all', 'all');
        Route::get('expense-categories/{id}', 'get')->where('id', '[0-9]+');
        Route::delete('expense-categories/{id}', 'delete')->where('id', '[0-9]+');
        Route::post('expense-categories', 'create');
        Route::post('expense-categories/{id}', 'update')->where('id', '[0-9]+');
        Route::delete('expense-categories', 'deleteMultiple');
    });

    Route::controller(ExpenseController::class)->group(function () {
        Route::get('expenses', 'search');
        Route::get('expenses/all', 'all');
        Route::get('expenses/{id}', 'get')->where('id', '[0-9]+');
        Route::delete('expenses/{id}', 'delete')->where('id', '[0-9]+');
        Route::post('expenses', 'create');
        Route::put('expenses/{id}', 'update')->where('id', '[0-9]+');
        Route::get('expenses/export', 'export');
    });

});
