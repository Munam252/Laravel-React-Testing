<?php

use App\Http\Controllers\UserDetailController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\User;
use App\Http\Controllers\MessageController;

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

    Route::get('chat', function () {
        $users = User::where('id', '!=', auth()->id())->get(['id', 'name', 'email']);
        return Inertia::render('chat', [
            'users' => $users,
        ]);
    })->name('chat');

    Route::get('chat/{user}', [MessageController::class, 'index'])->name('chat.conversation');
    Route::post('messages', [MessageController::class, 'store'])->name('messages.store');
    Route::get('messages/conversation/{user}', [MessageController::class, 'conversation'])->name('messages.conversation');
    Route::delete('messages/{id}', [MessageController::class, 'destroy'])->name('messages.destroy');

    // Inertia pages
    Route::get('quiz/global', function () {
        return Inertia::render('quiz/global');
    })->name('quiz.global');
    Route::get('quiz/list', function () {
        return Inertia::render('quiz/list');
    })->name('quiz.list');
    Route::get('quiz/view/{id}', function ($id) {
        return Inertia::render('quiz/view', ['quizId' => (int)$id]);
    })->name('quiz.view');

    // API endpoints
    Route::get('quiz/api/list', [\App\Http\Controllers\QuizController::class, 'index'])->name('quiz.api.list');
    Route::post('quiz/api/store', [\App\Http\Controllers\QuizController::class, 'store'])->name('quiz.api.store');
    Route::put('quiz/api/{quiz}', [\App\Http\Controllers\QuizController::class, 'update'])->name('quiz.api.update');
    Route::delete('quiz/api/{quiz}', [\App\Http\Controllers\QuizController::class, 'destroy'])->name('quiz.api.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
