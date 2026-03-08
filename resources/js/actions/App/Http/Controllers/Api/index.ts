import PlayerActivationController from './PlayerActivationController'
import AppVersionController from './AppVersionController'
import WidgetWebhookController from './WidgetWebhookController'
import SoketiWebhookController from './SoketiWebhookController'

const Api = {
    PlayerActivationController: Object.assign(PlayerActivationController, PlayerActivationController),
    AppVersionController: Object.assign(AppVersionController, AppVersionController),
    WidgetWebhookController: Object.assign(WidgetWebhookController, WidgetWebhookController),
    SoketiWebhookController: Object.assign(SoketiWebhookController, SoketiWebhookController),
}

export default Api