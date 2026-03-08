import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\TenantRoleController::search
* @see app/Http/Controllers/TenantRoleController.php:23
* @route '/api/roles/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/api/roles/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TenantRoleController::search
* @see app/Http/Controllers/TenantRoleController.php:23
* @route '/api/roles/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantRoleController::search
* @see app/Http/Controllers/TenantRoleController.php:23
* @route '/api/roles/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantRoleController::search
* @see app/Http/Controllers/TenantRoleController.php:23
* @route '/api/roles/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TenantRoleController::search
* @see app/Http/Controllers/TenantRoleController.php:23
* @route '/api/roles/search'
*/
const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantRoleController::search
* @see app/Http/Controllers/TenantRoleController.php:23
* @route '/api/roles/search'
*/
searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantRoleController::search
* @see app/Http/Controllers/TenantRoleController.php:23
* @route '/api/roles/search'
*/
searchForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

search.form = searchForm

/**
* @see \App\Http\Controllers\TenantRoleController::list
* @see app/Http/Controllers/TenantRoleController.php:211
* @route '/api/roles'
*/
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/roles',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TenantRoleController::list
* @see app/Http/Controllers/TenantRoleController.php:211
* @route '/api/roles'
*/
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TenantRoleController::list
* @see app/Http/Controllers/TenantRoleController.php:211
* @route '/api/roles'
*/
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantRoleController::list
* @see app/Http/Controllers/TenantRoleController.php:211
* @route '/api/roles'
*/
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TenantRoleController::list
* @see app/Http/Controllers/TenantRoleController.php:211
* @route '/api/roles'
*/
const listForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantRoleController::list
* @see app/Http/Controllers/TenantRoleController.php:211
* @route '/api/roles'
*/
listForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TenantRoleController::list
* @see app/Http/Controllers/TenantRoleController.php:211
* @route '/api/roles'
*/
listForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: list.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

list.form = listForm

const roles = {
    search: Object.assign(search, search),
    list: Object.assign(list, list),
}

export default roles