import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AppVersionController::check
* @see app/Http/Controllers/Api/AppVersionController.php:18
* @route '/api/v1/player/app-version'
*/
export const check = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: check.url(options),
    method: 'get',
})

check.definition = {
    methods: ["get","head"],
    url: '/api/v1/player/app-version',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AppVersionController::check
* @see app/Http/Controllers/Api/AppVersionController.php:18
* @route '/api/v1/player/app-version'
*/
check.url = (options?: RouteQueryOptions) => {
    return check.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AppVersionController::check
* @see app/Http/Controllers/Api/AppVersionController.php:18
* @route '/api/v1/player/app-version'
*/
check.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: check.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\AppVersionController::check
* @see app/Http/Controllers/Api/AppVersionController.php:18
* @route '/api/v1/player/app-version'
*/
check.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: check.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\AppVersionController::check
* @see app/Http/Controllers/Api/AppVersionController.php:18
* @route '/api/v1/player/app-version'
*/
const checkForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: check.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\AppVersionController::check
* @see app/Http/Controllers/Api/AppVersionController.php:18
* @route '/api/v1/player/app-version'
*/
checkForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: check.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\AppVersionController::check
* @see app/Http/Controllers/Api/AppVersionController.php:18
* @route '/api/v1/player/app-version'
*/
checkForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: check.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

check.form = checkForm

const AppVersionController = { check }

export default AppVersionController