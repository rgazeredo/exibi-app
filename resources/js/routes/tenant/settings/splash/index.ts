import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TenantSettingsController::deleteMethod
* @see app/Http/Controllers/TenantSettingsController.php:127
* @route '/tenant/settings/splash'
*/
export const deleteMethod = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/tenant/settings/splash',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteMethod
* @see app/Http/Controllers/TenantSettingsController.php:127
* @route '/tenant/settings/splash'
*/
deleteMethod.url = (options?: RouteQueryOptions) => {
    return deleteMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteMethod
* @see app/Http/Controllers/TenantSettingsController.php:127
* @route '/tenant/settings/splash'
*/
deleteMethod.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteMethod
* @see app/Http/Controllers/TenantSettingsController.php:127
* @route '/tenant/settings/splash'
*/
const deleteMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteMethod.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteMethod
* @see app/Http/Controllers/TenantSettingsController.php:127
* @route '/tenant/settings/splash'
*/
deleteMethodForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteMethod.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

deleteMethod.form = deleteMethodForm

const splash = {
    delete: Object.assign(deleteMethod, deleteMethod),
}

export default splash