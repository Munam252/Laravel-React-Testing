<?php

namespace App\Http\Controllers;

use App\Models\UserDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserDetailController extends Controller
{
    public function index()
    {
        $userDetails = auth()->user()->userDetails()->latest()->get();
        
        return Inertia::render('crud', [
            'userDetails' => $userDetails
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nickname' => 'required|string|max:255',
            'hobbies' => 'required|string',
            'description' => 'required|string',
        ]);

        $userDetail = auth()->user()->userDetails()->create([
            'nickname' => $request->nickname,
            'hobbies' => $request->hobbies,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'User detail added successfully!');
    }

    public function update(Request $request, UserDetail $userDetail)
    {
        // Ensure the user can only update their own details
        if ($userDetail->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'nickname' => 'required|string|max:255',
            'hobbies' => 'required|string',
            'description' => 'required|string',
        ]);

        $userDetail->update([
            'nickname' => $request->nickname,
            'hobbies' => $request->hobbies,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'User detail updated successfully!');
    }

    public function destroy(UserDetail $userDetail)
    {
        // Ensure the user can only delete their own details
        if ($userDetail->user_id !== auth()->id()) {
            abort(403);
        }

        $userDetail->delete();

        return redirect()->back()->with('success', 'User detail deleted successfully!');
    }

    public function show(UserDetail $userDetail)
    {
        return response()->json($userDetail);
    }
}
