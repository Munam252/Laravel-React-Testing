<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageController extends Controller
{
    // Show chat with a specific user
    public function index($userId)
    {
        $authId = auth()->id();
        $otherUser = User::findOrFail($userId);
        $messages = Message::where(function($q) use ($authId, $userId) {
            $q->where('sender_id', $authId)->where('receiver_id', $userId);
        })->orWhere(function($q) use ($authId, $userId) {
            $q->where('sender_id', $userId)->where('receiver_id', $authId);
        })->orderBy('created_at')->get();
        return Inertia::render('chat-conversation', [
            'otherUser' => $otherUser,
            'messages' => $messages,
        ]);
    }

    // Store a new message
    public function store(Request $request)
    {
        $data = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string',
        ]);
        $message = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $data['receiver_id'],
            'content' => $data['content'],
        ]);
        return response()->json(['message' => $message], 201);
    }

    // Polling endpoint for AJAX: get all messages between auth user and given user
    public function conversation($userId)
    {
        $authId = auth()->id();
        $messages = Message::where(function($q) use ($authId, $userId) {
            $q->where('sender_id', $authId)->where('receiver_id', $userId);
        })->orWhere(function($q) use ($authId, $userId) {
            $q->where('sender_id', $userId)->where('receiver_id', $authId);
        })->orderBy('created_at')->get();
        return response()->json(['messages' => $messages]);
    }

    // Delete a message (sender only)
    public function destroy(Request $request, $id)
    {
        $message = Message::findOrFail($id);
        if ($message->sender_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
        $forBoth = $request->input('for_both', false);
        if ($forBoth) {
            $message->is_deleted_for_both = true;
        } else {
            $message->deleted_by_sender = true;
        }
        $message->save();
        return response()->json(['status' => 'ok', 'id' => $message->id]);
    }
}
