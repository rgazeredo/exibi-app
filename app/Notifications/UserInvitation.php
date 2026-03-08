<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Password;

class UserInvitation extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $tenantName,
        public string $role,
        public ?string $inviterName = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $token = Password::createToken($notifiable);
        $url = url(route('password.reset', [
            'token' => $token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        $roleLabel = match ($this->role) {
            'admin' => 'Administrador',
            'editor' => 'Editor',
            'viewer' => 'Visualizador',
            default => $this->role,
        };

        return (new MailMessage)
            ->subject('Convite para '.$this->tenantName)
            ->greeting('Olá '.$notifiable->name.'!')
            ->line($this->inviterName
                ? "{$this->inviterName} convidou você para participar de **{$this->tenantName}** como **{$roleLabel}**."
                : "Você foi convidado para participar de **{$this->tenantName}** como **{$roleLabel}**.")
            ->line('Para acessar o sistema, você precisa criar sua senha clicando no botão abaixo:')
            ->action('Criar Senha', $url)
            ->line('Este link expira em 60 minutos.')
            ->line('Se você não esperava este convite, pode ignorar este email.')
            ->salutation('Atenciosamente, '.config('app.name'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tenant_name' => $this->tenantName,
            'role' => $this->role,
        ];
    }
}
