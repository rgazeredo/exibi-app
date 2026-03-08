import DashboardController from './DashboardController'
import TenantController from './TenantController'
import UserController from './UserController'
import AppReleaseController from './AppReleaseController'
import WidgetController from './WidgetController'

const Admin = {
    DashboardController: Object.assign(DashboardController, DashboardController),
    TenantController: Object.assign(TenantController, TenantController),
    UserController: Object.assign(UserController, UserController),
    AppReleaseController: Object.assign(AppReleaseController, AppReleaseController),
    WidgetController: Object.assign(WidgetController, WidgetController),
}

export default Admin