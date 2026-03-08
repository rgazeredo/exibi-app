import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import icon14263b from './icon'
import splash0dcd74 from './splash'
import users48860f from './users'
import rolesF85c84 from './roles'
/**
* @see \App\Http\Controllers\TenantSettingsController::update
* @see app/Http/Controllers/TenantSettingsController.php:33
* @route '/tenant/settings'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/tenant/settings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TenantSettingsController::update
* @see app/Http/Controllers/TenantSettingsController.php:33
* @route '/tenant/settings'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantSettingsController::update
* @see app/Http/Controllers/TenantSettingsController.php:33
* @route '/tenant/settings'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::update
* @see app/Http/Controllers/TenantSettingsController.php:33
* @route '/tenant/settings'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::update
* @see app/Http/Controllers/TenantSettingsController.php:33
* @route '/tenant/settings'
*/
updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\TenantSettingsController::icon
* @see app/Http/Controllers/TenantSettingsController.php:55
* @route '/tenant/settings/icon'
*/
export const icon = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: icon.url(options),
    method: 'post',
})

icon.definition = {
    methods: ["post"],
    url: '/tenant/settings/icon',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TenantSettingsController::icon
* @see app/Http/Controllers/TenantSettingsController.php:55
* @route '/tenant/settings/icon'
*/
icon.url = (options?: RouteQueryOptions) => {
    return icon.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantSettingsController::icon
* @see app/Http/Controllers/TenantSettingsController.php:55
* @route '/tenant/settings/icon'
*/
icon.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: icon.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::icon
* @see app/Http/Controllers/TenantSettingsController.php:55
* @route '/tenant/settings/icon'
*/
const iconForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: icon.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::icon
* @see app/Http/Controllers/TenantSettingsController.php:55
* @route '/tenant/settings/icon'
*/
iconForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: icon.url(options),
    method: 'post',
})

icon.form = iconForm

/**
* @see \App\Http\Controllers\TenantSettingsController::splash
* @see app/Http/Controllers/TenantSettingsController.php:84
* @route '/tenant/settings/splash'
*/
export const splash = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: splash.url(options),
    method: 'post',
})

splash.definition = {
    methods: ["post"],
    url: '/tenant/settings/splash',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TenantSettingsController::splash
* @see app/Http/Controllers/TenantSettingsController.php:84
* @route '/tenant/settings/splash'
*/
splash.url = (options?: RouteQueryOptions) => {
    return splash.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantSettingsController::splash
* @see app/Http/Controllers/TenantSettingsController.php:84
* @route '/tenant/settings/splash'
*/
splash.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: splash.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::splash
* @see app/Http/Controllers/TenantSettingsController.php:84
* @route '/tenant/settings/splash'
*/
const splashForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: splash.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::splash
* @see app/Http/Controllers/TenantSettingsController.php:84
* @route '/tenant/settings/splash'
*/
splashForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: splash.url(options),
    method: 'post',
})

splash.form = splashForm

/**
* @see \App\Http\Controllers\TenantUserController::users
* @see app/Http/Controllers/TenantUserController.php:19
* @route '/tenant/settings/users'
*/
export const users = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: users.url(options),
    method: 'get',
})

users.definition = {
    methods: ["get","head"],
    url: '/tenant/settings/users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TenantUserController::users
* @see app/Http/Controllers/TenantUserController.php:19
* @route '/tenant/settings/users'
*/
users.url = (options?: RouteQueryOptions) => {
    return users.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantUserController::users
* @see app/Http/Controllers/TenantUserController.php:19
* @route '/tenant/settings/users'
*/
users.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: users.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantUserController::users
* @see app/Http/Controllers/TenantUserController.php:19
* @route '/tenant/settings/users'
*/
users.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: users.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TenantUserController::users
* @see app/Http/Controllers/TenantUserController.php:19
* @route '/tenant/settings/users'
*/
const usersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: users.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantUserController::users
* @see app/Http/Controllers/TenantUserController.php:19
* @route '/tenant/settings/users'
*/
usersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: users.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantUserController::users
* @see app/Http/Controllers/TenantUserController.php:19
* @route '/tenant/settings/users'
*/
usersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: users.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

users.form = usersForm

/**
* @see \App\Http\Controllers\TenantRoleController::roles
* @see app/Http/Controllers/TenantRoleController.php:16
* @route '/tenant/settings/roles'
*/
export const roles = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: roles.url(options),
    method: 'get',
})

roles.definition = {
    methods: ["get","head"],
    url: '/tenant/settings/roles',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TenantRoleController::roles
* @see app/Http/Controllers/TenantRoleController.php:16
* @route '/tenant/settings/roles'
*/
roles.url = (options?: RouteQueryOptions) => {
    return roles.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantRoleController::roles
* @see app/Http/Controllers/TenantRoleController.php:16
* @route '/tenant/settings/roles'
*/
roles.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: roles.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantRoleController::roles
* @see app/Http/Controllers/TenantRoleController.php:16
* @route '/tenant/settings/roles'
*/
roles.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: roles.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TenantRoleController::roles
* @see app/Http/Controllers/TenantRoleController.php:16
* @route '/tenant/settings/roles'
*/
const rolesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: roles.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantRoleController::roles
* @see app/Http/Controllers/TenantRoleController.php:16
* @route '/tenant/settings/roles'
*/
rolesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: roles.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantRoleController::roles
* @see app/Http/Controllers/TenantRoleController.php:16
* @route '/tenant/settings/roles'
*/
rolesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: roles.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

roles.form = rolesForm

const settings = {
    update: Object.assign(update, update),
    icon: Object.assign(icon, icon14263b),
    splash: Object.assign(splash, splash0dcd74),
    users: Object.assign(users, users48860f),
    roles: Object.assign(roles, rolesF85c84),
}

export default settings