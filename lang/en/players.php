<?php

return [
    // Activation
    'invalid_activation_code' => 'Invalid or expired activation code.',
    'activation_code_already_used' => 'This activation code has already been used.',
    'activationCode' => 'Activation Code',
    'activationCodeHelp' => 'Enter the code displayed on the device screen',

    // General
    'title' => 'Players',
    'playerDetails' => 'Player Details',
    'deletePlayer' => 'Delete Player',
    'deleteConfirm' => 'Are you sure you want to delete the player ":name"? This action cannot be undone.',

    // Status
    'status' => [
        'active' => 'Active',
        'inactive' => 'Inactive',
        'online' => 'Online',
        'offline' => 'Offline',
    ],

    // Layout
    'layout' => 'Layout',
    'ownLayout' => 'own',
    'inheritedFrom' => 'inherited from',
    'noneAssigned' => 'None assigned',

    // Details
    'lastSeen' => 'Last seen',
    'orientation' => 'Orientation',
    'updateInterval' => 'Update interval',
    'minutes' => 'minutes',
    'created' => 'Created',

    // Now Playing
    'nowPlaying' => 'Now Playing',
    'nowPlayingEmpty' => 'No content playing',
    'mediaDuration' => 'Duration',
    'playedAt' => 'Played at',
    'playlist' => 'Playlist',
    'blackScreenActive' => 'Black screen active',
    'outsideOperatingHours' => 'Outside operating hours',
    'nextStart' => 'Next start',
    'screenshot' => 'Screenshot',
    'screenshotTitle' => 'Player Screenshot',
    'capturingScreen' => 'Capturing screen...',
    'newScreenshot' => 'New Screenshot',
    'screenshotFailed' => 'Failed to capture screenshot',
    'screenshotTimeout' => 'Screenshot capture timed out',
    'mediaPreview' => 'Media Preview',
    'playerOffline' => 'Player offline',
    'mainRegion' => 'Main',
    'noMediaPlaying' => 'No media playing',

    // WebSocket status
    'wsConnected' => 'Connected',
    'wsConnecting' => 'Connecting...',
    'wsDisconnected' => 'Disconnected',

    // Remote Commands
    'remoteCommands' => 'Remote Commands',
    'remoteShortcuts' => 'Remote Shortcuts',
    'remoteShortcutsDesc' => 'List of shortcuts available on the player remote control',
    'refreshPlayer' => 'Refresh Player',
    'refreshPlayerDesc' => 'Send command to update the player.',
    'showToastOnPlayer' => 'Show notification on player',
    'showToastOnPlayerDesc' => 'Shows a message on the player screen confirming the update.',
    'checkForUpdates' => 'Check for Updates',
    'reboot' => 'Reboot',
    'commandSent' => 'Command ":label" sent successfully.',
    'commandFailed' => 'Failed to send command.',
    'commandsNote' => 'Commands only work when the player is online.',

    // Replace Player
    'replacePlayer' => 'Replace Player',
    'replacePlayerDesc' => 'Replace this player with a new device. The new device will receive all configurations.',
    'playerToReplace' => 'Player to be replaced',
    'newDeviceActivationCode' => 'New device activation code',
    'confirmReplace' => 'Confirm Replacement',
    'replaceWarningTitle' => 'Warning',
    'replaceWarningNewFlow' => 'The new device will be activated with all settings from this player. This player will be deleted after replacement.',
    'replaced_successfully' => 'Player replaced successfully.',

    // Operating Hours
    'operatingHours' => 'Operating Hours',
    '24hours' => '24 hours',

    // Connection History
    'connectionHistory' => 'Connection History',
];
