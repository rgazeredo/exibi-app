import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import settings69f00b from './settings'
/**
* @see \App\Http\Controllers\TenantController::select
* @see app/Http/Controllers/TenantController.php:14
* @route '/tenant/select'
*/
export const select = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: select.url(options),
    method: 'get',
})

select.definition = {
    methods: ["get","head"],
    url: '/tenant/select',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TenantController::select
* @see app/Http/Controllers/TenantController.php:14
* @route '/tenant/select'
*/
select.url = (options?: RouteQueryOptions) => {
    return select.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantController::select
* @see app/Http/Controllers/TenantController.php:14
* @route '/tenant/select'
*/
select.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: select.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantController::select
* @see app/Http/Controllers/TenantController.php:14
* @route '/tenant/select'
*/
select.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: select.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TenantController::select
* @see app/Http/Controllers/TenantController.php:14
* @route '/tenant/select'
*/
const selectForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: select.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantController::select
* @see app/Http/Controllers/TenantController.php:14
* @route '/tenant/select'
*/
selectForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: select.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantController::select
* @see app/Http/Controllers/TenantController.php:14
* @route '/tenant/select'
*/
selectForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: select.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

select.form = selectForm

/**
* @see \App\Http\Controllers\TenantController::switchMethod
* @see app/Http/Controllers/TenantController.php:50
* @route '/tenant/switch'
*/
export const switchMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: switchMethod.url(options),
    method: 'post',
})

switchMethod.definition = {
    methods: ["post"],
    url: '/tenant/switch',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TenantController::switchMethod
* @see app/Http/Controllers/TenantController.php:50
* @route '/tenant/switch'
*/
switchMethod.url = (options?: RouteQueryOptions) => {
    return switchMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantController::switchMethod
* @see app/Http/Controllers/TenantController.php:50
* @route '/tenant/switch'
*/
switchMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: switchMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantController::switchMethod
* @see app/Http/Controllers/TenantController.php:50
* @route '/tenant/switch'
*/
const switchMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: switchMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantController::switchMethod
* @see app/Http/Controllers/TenantController.php:50
* @route '/tenant/switch'
*/
switchMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: switchMethod.url(options),
    method: 'post',
})

switchMethod.form = switchMethodForm

/**
* @see \App\Http\Controllers\TenantController::current
* @see app/Http/Controllers/TenantController.php:77
* @route '/tenant/current'
*/
export const current = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: current.url(options),
    method: 'get',
})

current.definition = {
    methods: ["get","head"],
    url: '/tenant/current',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TenantController::current
* @see app/Http/Controllers/TenantController.php:77
* @route '/tenant/current'
*/
current.url = (options?: RouteQueryOptions) => {
    return current.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantController::current
* @see app/Http/Controllers/TenantController.php:77
* @route '/tenant/current'
*/
current.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: current.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantController::current
* @see app/Http/Controllers/TenantController.php:77
* @route '/tenant/current'
*/
current.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: current.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TenantController::current
* @see app/Http/Controllers/TenantController.php:77
* @route '/tenant/current'
*/
const currentForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: current.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantController::current
* @see app/Http/Controllers/TenantController.php:77
* @route '/tenant/current'
*/
currentForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: current.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantController::current
* @see app/Http/Controllers/TenantController.php:77
* @route '/tenant/current'
*/
currentForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: current.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

current.form = currentForm

/**
* @see \App\Http\Controllers\TenantSettingsController::settings
* @see app/Http/Controllers/TenantSettingsController.php:14
* @route '/tenant/settings'
*/
export const settings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})

settings.definition = {
    methods: ["get","head"],
    url: '/tenant/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TenantSettingsController::settings
* @see app/Http/Controllers/TenantSettingsController.php:14
* @route '/tenant/settings'
*/
settings.url = (options?: RouteQueryOptions) => {
    return settings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantSettingsController::settings
* @see app/Http/Controllers/TenantSettingsController.php:14
* @route '/tenant/settings'
*/
settings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::settings
* @see app/Http/Controllers/TenantSettingsController.php:14
* @route '/tenant/settings'
*/
settings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: settings.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::settings
* @see app/Http/Controllers/TenantSettingsController.php:14
* @route '/tenant/settings'
*/
const settingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: settings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::settings
* @see app/Http/Controllers/TenantSettingsController.php:14
* @route '/tenant/settings'
*/
settingsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: settings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::settings
* @see app/Http/Controllers/TenantSettingsController.php:14
* @route '/tenant/settings'
*/
settingsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: settings.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

settings.form = settingsForm

const tenant = {
    select: Object.assign(select, select),
    switch: Object.assign(switchMethod, switchMethod),
    current: Object.assign(current, current),
    settings: Object.assign(settings, settings69f00b),
}

export default tenant