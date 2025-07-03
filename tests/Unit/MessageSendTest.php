<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Message;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageSendTest extends TestCase
{
    use RefreshDatabase;

    public function test_message_can_be_created_and_stored()
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        $message = Message::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'content' => 'Unit test message',
        ]);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'content' => 'Unit test message',
        ]);
    }
} 