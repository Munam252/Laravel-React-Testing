<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserDetailReadTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_detail_can_be_read()
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $detail = UserDetail::create([
            'user_id' => $user->id,
            'nickname' => 'ReadTest Nick',
            'hobbies' => 'ReadTest hobbies',
            'description' => 'ReadTest description',
        ]);

        $found = UserDetail::find($detail->id);

        $this->assertNotNull($found);
        $this->assertEquals('ReadTest Nick', $found->nickname);
        $this->assertEquals('ReadTest hobbies', $found->hobbies);
        $this->assertEquals('ReadTest description', $found->description);
        $this->assertEquals($user->id, $found->user_id);
    }
} 