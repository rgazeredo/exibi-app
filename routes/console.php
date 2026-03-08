<?php

use App\Jobs\CleanupExpiredActivations;
use App\Jobs\CleanupHeartbeats;
use App\Jobs\RegenerateWidgets;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Jobs
|--------------------------------------------------------------------------
*/

// Cleanup old heartbeat records daily at 3:00 AM
Schedule::job(new CleanupHeartbeats)->daily()->at('03:00');

// Cleanup expired activation codes every hour
Schedule::job(new CleanupExpiredActivations)->hourly();

// Check and regenerate widgets that need updating
Schedule::job(new RegenerateWidgets)->everyFiveMinutes();
