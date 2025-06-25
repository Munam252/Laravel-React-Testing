<?php

use App\Http\Controllers\UserDetailController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    Route::get('crud', [UserDetailController::class, 'index'])->name('crud');
    Route::post('crud', [UserDetailController::class, 'store'])->name('crud.store');
    Route::put('crud/{userDetail}', [UserDetailController::class, 'update'])->name('crud.update');
    Route::delete('crud/{userDetail}', [UserDetailController::class, 'destroy'])->name('crud.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
