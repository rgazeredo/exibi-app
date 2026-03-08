import Api from './Api'
import TenantController from './TenantController'
import Admin from './Admin'
import DashboardController from './DashboardController'
import PlayerController from './PlayerController'
import MediaController from './MediaController'
import WidgetController from './WidgetController'
import PlaylistController from './PlaylistController'
import TagController from './TagController'
import TenantUserController from './TenantUserController'
import TenantRoleController from './TenantRoleController'
import TenantSettingsController from './TenantSettingsController'
import ReportController from './ReportController'
import Settings from './Settings'

const Controllers = {
    Api: Object.assign(Api, Api),
    TenantController: Object.assign(TenantController, TenantController),
    Admin: Object.assign(Admin, Admin),
    DashboardController: Object.assign(DashboardController, DashboardController),
    PlayerController: Object.assign(PlayerController, PlayerController),
    MediaController: Object.assign(MediaController, MediaController),
    WidgetController: Object.assign(WidgetController, WidgetController),
    PlaylistController: Object.assign(PlaylistController, PlaylistController),
    TagController: Object.assign(TagController, TagController),
    TenantUserController: Object.assign(TenantUserController, TenantUserController),
    TenantRoleController: Object.assign(TenantRoleController, TenantRoleController),
    TenantSettingsController: Object.assign(TenantSettingsController, TenantSettingsController),
    ReportController: Object.assign(ReportController, ReportController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers