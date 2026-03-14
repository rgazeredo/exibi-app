import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TenantSettingsController::deleteMethod
* @see app/Http/Controllers/TenantSettingsController.php:110
* @route '/tenant/settings/icon'
*/
export const deleteMethod = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/tenant/settings/icon',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteMethod
* @see app/Http/Controllers/TenantSettingsController.php:110
* @route '/tenant/settings/icon'
*/
deleteMethod.url = (options?: RouteQueryOptions) => {
    return deleteMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteMethod
* @see app/Http/Controllers/TenantSettingsController.php:110
* @route '/tenant/settings/icon'
*/
deleteMethod.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteMethod
* @see app/Http/Controllers/TenantSettingsController.php:110
* @route '/tenant/settings/icon'
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
* @see app/Http/Controllers/TenantSettingsController.php:110
* @route '/tenant/settings/icon'
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

const icon = {
    delete: Object.assign(deleteMethod, deleteMethod),
}

export default icon