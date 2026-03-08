<?php

return [
    // Activation
    'invalid_activation_code' => 'Código de ativação inválido ou expirado.',
    'activation_code_already_used' => 'Este código de ativação já foi utilizado.',
    'activationCode' => 'Código de Ativação',
    'activationCodeHelp' => 'Digite o código exibido na tela do dispositivo',

    // General
    'title' => 'Players',
    'playerDetails' => 'Detalhes do Player',
    'deletePlayer' => 'Excluir Player',
    'deleteConfirm' => 'Tem certeza que deseja excluir o player ":name"? Esta ação não pode ser desfeita.',

    // Status
    'status' => [
        'active' => 'Ativo',
        'inactive' => 'Inativo',
        'online' => 'Online',
        'offline' => 'Offline',
    ],

    // Layout
    'layout' => 'Layout',
    'ownLayout' => 'próprio',
    'inheritedFrom' => 'herdado de',
    'noneAssigned' => 'Nenhum atribuído',

    // Details
    'lastSeen' => 'Última conexão',
    'orientation' => 'Orientação',
    'updateInterval' => 'Intervalo de atualização',
    'minutes' => 'minutos',
    'created' => 'Criado em',

    // Now Playing
    'nowPlaying' => 'Reproduzindo agora',
    'nowPlayingEmpty' => 'Nenhum conteúdo em reprodução',
    'mediaDuration' => 'Duração',
    'playedAt' => 'Reproduzido às',
    'playlist' => 'Playlist',
    'blackScreenActive' => 'Tela preta ativa',
    'outsideOperatingHours' => 'Fora do horário de funcionamento',
    'nextStart' => 'Próximo início',
    'screenshot' => 'Captura de Tela',
    'screenshotTitle' => 'Captura de Tela do Player',
    'capturingScreen' => 'Capturando tela...',
    'newScreenshot' => 'Nova Captura',
    'screenshotFailed' => 'Falha ao capturar tela',
    'screenshotTimeout' => 'Tempo esgotado ao capturar tela',
    'mediaPreview' => 'Preview da Mídia',
    'playerOffline' => 'Player offline',
    'mainRegion' => 'Principal',
    'noMediaPlaying' => 'Nenhuma mídia reproduzindo',

    // WebSocket status
    'wsConnected' => 'Conectado',
    'wsConnecting' => 'Conectando...',
    'wsDisconnected' => 'Desconectado',

    // Remote Commands
    'remoteCommands' => 'Comandos Remotos',
    'remoteShortcuts' => 'Atalhos do Controle',
    'remoteShortcutsDesc' => 'Lista de atalhos disponíveis no controle remoto do player',
    'refreshPlaylist' => 'Atualizar Playlist',
    'refreshPlaylistDesc' => 'Enviar comando para atualizar a playlist no player.',
    'showToastOnPlayer' => 'Exibir notificação no player',
    'showToastOnPlayerDesc' => 'Mostra uma mensagem na tela do player confirmando a atualização.',
    'checkForUpdates' => 'Verificar Atualizações',
    'reboot' => 'Reiniciar',
    'commandSent' => 'Comando ":label" enviado com sucesso.',
    'commandFailed' => 'Falha ao enviar comando.',
    'commandsNote' => 'Os comandos só funcionam quando o player está online.',

    // Replace Player
    'replacePlayer' => 'Substituir Player',
    'replacePlayerDesc' => 'Substitua este player por um novo dispositivo. O novo dispositivo receberá todas as configurações.',
    'playerToReplace' => 'Player a ser substituído',
    'newDeviceActivationCode' => 'Código de ativação do novo dispositivo',
    'confirmReplace' => 'Confirmar Substituição',
    'replaceWarningTitle' => 'Atenção',
    'replaceWarningNewFlow' => 'O novo dispositivo será ativado com todas as configurações deste player. Este player será excluído após a substituição.',
    'replaced_successfully' => 'Player substituído com sucesso.',

    // Operating Hours
    'operatingHours' => 'Horário de Funcionamento',
    '24hours' => '24 horas',

    // Connection History
    'connectionHistory' => 'Histórico de Conexão',
];
