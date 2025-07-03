<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Message;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_sender_can_delete_message_for_myself()
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();
        $message = Message::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'content' => 'Delete for myself',
        ]);

        $message->deleted_by_sender = true;
        $message->save();

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'deleted_by_sender' => true,
            'is_deleted_for_both' => false,
        ]);
    }

    public function test_sender_can_delete_message_for_both()
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();
        $message = Message::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'content' => 'Delete for both',
        ]);

        $message->is_deleted_for_both = true;
        $message->save();

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'is_deleted_for_both' => true,
        ]);
    }
} 