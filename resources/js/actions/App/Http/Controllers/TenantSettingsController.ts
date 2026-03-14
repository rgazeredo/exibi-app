import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TenantSettingsController::index
* @see app/Http/Controllers/TenantSettingsController.php:14
* @route '/tenant/settings'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/tenant/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TenantSettingsController::index
* @see app/Http/Controllers/TenantSettingsController.php:14
* @route '/tenant/settings'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantSettingsController::index
* @see app/Http/Controllers/TenantSettingsController.php:14
* @route '/tenant/settings'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::index
* @see app/Http/Controllers/TenantSettingsController.php:14
* @route '/tenant/settings'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::index
* @see app/Http/Controllers/TenantSettingsController.php:14
* @route '/tenant/settings'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::index
* @see app/Http/Controllers/TenantSettingsController.php:14
* @route '/tenant/settings'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::index
* @see app/Http/Controllers/TenantSettingsController.php:14
* @route '/tenant/settings'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\TenantSettingsController::update
* @see app/Http/Controllers/TenantSettingsController.php:32
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
* @see app/Http/Controllers/TenantSettingsController.php:32
* @route '/tenant/settings'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantSettingsController::update
* @see app/Http/Controllers/TenantSettingsController.php:32
* @route '/tenant/settings'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::update
* @see app/Http/Controllers/TenantSettingsController.php:32
* @route '/tenant/settings'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::update
* @see app/Http/Controllers/TenantSettingsController.php:32
* @route '/tenant/settings'
*/
updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\TenantSettingsController::uploadIcon
* @see app/Http/Controllers/TenantSettingsController.php:52
* @route '/tenant/settings/icon'
*/
export const uploadIcon = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadIcon.url(options),
    method: 'post',
})

uploadIcon.definition = {
    methods: ["post"],
    url: '/tenant/settings/icon',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TenantSettingsController::uploadIcon
* @see app/Http/Controllers/TenantSettingsController.php:52
* @route '/tenant/settings/icon'
*/
uploadIcon.url = (options?: RouteQueryOptions) => {
    return uploadIcon.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantSettingsController::uploadIcon
* @see app/Http/Controllers/TenantSettingsController.php:52
* @route '/tenant/settings/icon'
*/
uploadIcon.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadIcon.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::uploadIcon
* @see app/Http/Controllers/TenantSettingsController.php:52
* @route '/tenant/settings/icon'
*/
const uploadIconForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: uploadIcon.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::uploadIcon
* @see app/Http/Controllers/TenantSettingsController.php:52
* @route '/tenant/settings/icon'
*/
uploadIconForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: uploadIcon.url(options),
    method: 'post',
})

uploadIcon.form = uploadIconForm

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteIcon
* @see app/Http/Controllers/TenantSettingsController.php:110
* @route '/tenant/settings/icon'
*/
export const deleteIcon = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteIcon.url(options),
    method: 'delete',
})

deleteIcon.definition = {
    methods: ["delete"],
    url: '/tenant/settings/icon',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteIcon
* @see app/Http/Controllers/TenantSettingsController.php:110
* @route '/tenant/settings/icon'
*/
deleteIcon.url = (options?: RouteQueryOptions) => {
    return deleteIcon.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteIcon
* @see app/Http/Controllers/TenantSettingsController.php:110
* @route '/tenant/settings/icon'
*/
deleteIcon.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteIcon.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteIcon
* @see app/Http/Controllers/TenantSettingsController.php:110
* @route '/tenant/settings/icon'
*/
const deleteIconForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteIcon.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteIcon
* @see app/Http/Controllers/TenantSettingsController.php:110
* @route '/tenant/settings/icon'
*/
deleteIconForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteIcon.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

deleteIcon.form = deleteIconForm

/**
* @see \App\Http\Controllers\TenantSettingsController::uploadSplash
* @see app/Http/Controllers/TenantSettingsController.php:81
* @route '/tenant/settings/splash'
*/
export const uploadSplash = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadSplash.url(options),
    method: 'post',
})

uploadSplash.definition = {
    methods: ["post"],
    url: '/tenant/settings/splash',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TenantSettingsController::uploadSplash
* @see app/Http/Controllers/TenantSettingsController.php:81
* @route '/tenant/settings/splash'
*/
uploadSplash.url = (options?: RouteQueryOptions) => {
    return uploadSplash.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantSettingsController::uploadSplash
* @see app/Http/Controllers/TenantSettingsController.php:81
* @route '/tenant/settings/splash'
*/
uploadSplash.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadSplash.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::uploadSplash
* @see app/Http/Controllers/TenantSettingsController.php:81
* @route '/tenant/settings/splash'
*/
const uploadSplashForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: uploadSplash.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::uploadSplash
* @see app/Http/Controllers/TenantSettingsController.php:81
* @route '/tenant/settings/splash'
*/
uploadSplashForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: uploadSplash.url(options),
    method: 'post',
})

uploadSplash.form = uploadSplashForm

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteSplash
* @see app/Http/Controllers/TenantSettingsController.php:124
* @route '/tenant/settings/splash'
*/
export const deleteSplash = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteSplash.url(options),
    method: 'delete',
})

deleteSplash.definition = {
    methods: ["delete"],
    url: '/tenant/settings/splash',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteSplash
* @see app/Http/Controllers/TenantSettingsController.php:124
* @route '/tenant/settings/splash'
*/
deleteSplash.url = (options?: RouteQueryOptions) => {
    return deleteSplash.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteSplash
* @see app/Http/Controllers/TenantSettingsController.php:124
* @route '/tenant/settings/splash'
*/
deleteSplash.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteSplash.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteSplash
* @see app/Http/Controllers/TenantSettingsController.php:124
* @route '/tenant/settings/splash'
*/
const deleteSplashForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteSplash.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TenantSettingsController::deleteSplash
* @see app/Http/Controllers/TenantSettingsController.php:124
* @route '/tenant/settings/splash'
*/
deleteSplashForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteSplash.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

deleteSplash.form = deleteSplashForm

const TenantSettingsController = { index, update, uploadIcon, deleteIcon, uploadSplash, deleteSplash }

export default TenantSettingsController