<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserDetailDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_detail_can_be_deleted()
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $detail = UserDetail::create([
            'user_id' => $user->id,
            'nickname' => 'DeleteTest Nick',
            'hobbies' => 'DeleteTest hobbies',
            'description' => 'DeleteTest description',
        ]);

        $detail->delete();

        $this->assertDatabaseMissing('user_details', [
            'id' => $detail->id,
            'nickname' => 'DeleteTest Nick',
        ]);
    }
} 