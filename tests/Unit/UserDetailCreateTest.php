<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserDetailCreateTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_detail_can_be_created()
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $detail = UserDetail::create([
            'user_id' => $user->id,
            'nickname' => 'UnitTest Nick',
            'hobbies' => 'UnitTest hobbies',
            'description' => 'UnitTest description',
        ]);

        $this->assertDatabaseHas('user_details', [
            'id' => $detail->id,
            'user_id' => $user->id,
            'nickname' => 'UnitTest Nick',
            'hobbies' => 'UnitTest hobbies',
            'description' => 'UnitTest description',
        ]);
    }
} 