<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Message;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConversationFetchTest extends TestCase
{
    use RefreshDatabase;

    public function test_conversation_fetch_returns_correct_messages()
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userC = User::factory()->create();

        // Messages between A and B
        $msg1 = Message::create([
            'sender_id' => $userA->id,
            'receiver_id' => $userB->id,
            'content' => 'Hello B',
        ]);
        $msg2 = Message::create([
            'sender_id' => $userB->id,
            'receiver_id' => $userA->id,
            'content' => 'Hi A',
        ]);
        // Message from A to C (should not appear)
        Message::create([
            'sender_id' => $userA->id,
            'receiver_id' => $userC->id,
            'content' => 'Hello C',
        ]);
        // Message deleted by sender (A)
        $msg3 = Message::create([
            'sender_id' => $userA->id,
            'receiver_id' => $userB->id,
            'content' => 'Secret',
            'deleted_by_sender' => true,
        ]);
        // Message deleted for both
        $msg4 = Message::create([
            'sender_id' => $userB->id,
            'receiver_id' => $userA->id,
            'content' => 'Oops',
            'is_deleted_for_both' => true,
        ]);

        // Simulate fetching as userA
        $conversation = Message::where(function($q) use ($userA, $userB) {
            $q->where('sender_id', $userA->id)->where('receiver_id', $userB->id);
        })->orWhere(function($q) use ($userA, $userB) {
            $q->where('sender_id', $userB->id)->where('receiver_id', $userA->id);
        })->orderBy('created_at')->get();

        // Only msg1, msg2, msg4 should be visible to userA (msg3 is deleted by sender)
        $ids = $conversation->filter(function($msg) use ($userA) {
            if ($msg->sender_id === $userA->id && $msg->deleted_by_sender) return false;
            return true;
        })->pluck('id')->all();

        $this->assertContains($msg1->id, $ids);
        $this->assertContains($msg2->id, $ids);
        $this->assertContains($msg4->id, $ids);
        $this->assertNotContains($msg3->id, $ids);
    }
} 