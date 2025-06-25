<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserDetailUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_detail_can_be_updated()
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $detail = UserDetail::create([
            'user_id' => $user->id,
            'nickname' => 'Old Nick',
            'hobbies' => 'Old hobbies',
            'description' => 'Old description',
        ]);

        $detail->update([
            'nickname' => 'Updated Nick',
            'hobbies' => 'Updated hobbies',
            'description' => 'Updated description',
        ]);

        $this->assertDatabaseHas('user_details', [
            'id' => $detail->id,
            'nickname' => 'Updated Nick',
            'hobbies' => 'Updated hobbies',
            'description' => 'Updated description',
        ]);
    }
} 