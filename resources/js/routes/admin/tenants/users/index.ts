import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\TenantController::index
* @see app/Http/Controllers/Admin/TenantController.php:374
* @route '/admin/tenants/{tenant}/users'
*/
export const index = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/tenants/{tenant}/users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::index
* @see app/Http/Controllers/Admin/TenantController.php:374
* @route '/admin/tenants/{tenant}/users'
*/
index.url = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { tenant: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { tenant: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            tenant: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        tenant: typeof args.tenant === 'object'
        ? args.tenant.id
        : args.tenant,
    }

    return index.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::index
* @see app/Http/Controllers/Admin/TenantController.php:374
* @route '/admin/tenants/{tenant}/users'
*/
index.get = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::index
* @see app/Http/Controllers/Admin/TenantController.php:374
* @route '/admin/tenants/{tenant}/users'
*/
index.head = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::index
* @see app/Http/Controllers/Admin/TenantController.php:374
* @route '/admin/tenants/{tenant}/users'
*/
const indexForm = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::index
* @see app/Http/Controllers/Admin/TenantController.php:374
* @route '/admin/tenants/{tenant}/users'
*/
indexForm.get = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::index
* @see app/Http/Controllers/Admin/TenantController.php:374
* @route '/admin/tenants/{tenant}/users'
*/
indexForm.head = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Admin\TenantController::search
* @see app/Http/Controllers/Admin/TenantController.php:386
* @route '/admin/api/tenants/{tenant}/users/search'
*/
export const search = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(args, options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/admin/api/tenants/{tenant}/users/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::search
* @see app/Http/Controllers/Admin/TenantController.php:386
* @route '/admin/api/tenants/{tenant}/users/search'
*/
search.url = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { tenant: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { tenant: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            tenant: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        tenant: typeof args.tenant === 'object'
        ? args.tenant.id
        : args.tenant,
    }

    return search.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::search
* @see app/Http/Controllers/Admin/TenantController.php:386
* @route '/admin/api/tenants/{tenant}/users/search'
*/
search.get = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::search
* @see app/Http/Controllers/Admin/TenantController.php:386
* @route '/admin/api/tenants/{tenant}/users/search'
*/
search.head = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::search
* @see app/Http/Controllers/Admin/TenantController.php:386
* @route '/admin/api/tenants/{tenant}/users/search'
*/
const searchForm = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::search
* @see app/Http/Controllers/Admin/TenantController.php:386
* @route '/admin/api/tenants/{tenant}/users/search'
*/
searchForm.get = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::search
* @see app/Http/Controllers/Admin/TenantController.php:386
* @route '/admin/api/tenants/{tenant}/users/search'
*/
searchForm.head = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

search.form = searchForm

/**
* @see \App\Http\Controllers\Admin\TenantController::create
* @see app/Http/Controllers/Admin/TenantController.php:446
* @route '/admin/tenants/{tenant}/users/create'
*/
export const create = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/tenants/{tenant}/users/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::create
* @see app/Http/Controllers/Admin/TenantController.php:446
* @route '/admin/tenants/{tenant}/users/create'
*/
create.url = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { tenant: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { tenant: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            tenant: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        tenant: typeof args.tenant === 'object'
        ? args.tenant.id
        : args.tenant,
    }

    return create.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::create
* @see app/Http/Controllers/Admin/TenantController.php:446
* @route '/admin/tenants/{tenant}/users/create'
*/
create.get = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::create
* @see app/Http/Controllers/Admin/TenantController.php:446
* @route '/admin/tenants/{tenant}/users/create'
*/
create.head = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::create
* @see app/Http/Controllers/Admin/TenantController.php:446
* @route '/admin/tenants/{tenant}/users/create'
*/
const createForm = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::create
* @see app/Http/Controllers/Admin/TenantController.php:446
* @route '/admin/tenants/{tenant}/users/create'
*/
createForm.get = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::create
* @see app/Http/Controllers/Admin/TenantController.php:446
* @route '/admin/tenants/{tenant}/users/create'
*/
createForm.head = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

create.form = createForm

/**
* @see \App\Http\Controllers\Admin\TenantController::store
* @see app/Http/Controllers/Admin/TenantController.php:458
* @route '/admin/tenants/{tenant}/users'
*/
export const store = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/tenants/{tenant}/users',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::store
* @see app/Http/Controllers/Admin/TenantController.php:458
* @route '/admin/tenants/{tenant}/users'
*/
store.url = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { tenant: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { tenant: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            tenant: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        tenant: typeof args.tenant === 'object'
        ? args.tenant.id
        : args.tenant,
    }

    return store.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::store
* @see app/Http/Controllers/Admin/TenantController.php:458
* @route '/admin/tenants/{tenant}/users'
*/
store.post = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::store
* @see app/Http/Controllers/Admin/TenantController.php:458
* @route '/admin/tenants/{tenant}/users'
*/
const storeForm = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::store
* @see app/Http/Controllers/Admin/TenantController.php:458
* @route '/admin/tenants/{tenant}/users'
*/
storeForm.post = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\TenantController::destroy
* @see app/Http/Controllers/Admin/TenantController.php:514
* @route '/admin/tenants/{tenant}/users/{user}'
*/
export const destroy = (args: { tenant: string | { id: string }, user: string | { id: string } } | [tenant: string | { id: string }, user: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/tenants/{tenant}/users/{user}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::destroy
* @see app/Http/Controllers/Admin/TenantController.php:514
* @route '/admin/tenants/{tenant}/users/{user}'
*/
destroy.url = (args: { tenant: string | { id: string }, user: string | { id: string } } | [tenant: string | { id: string }, user: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            tenant: args[0],
            user: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        tenant: typeof args.tenant === 'object'
        ? args.tenant.id
        : args.tenant,
        user: typeof args.user === 'object'
        ? args.user.id
        : args.user,
    }

    return destroy.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::destroy
* @see app/Http/Controllers/Admin/TenantController.php:514
* @route '/admin/tenants/{tenant}/users/{user}'
*/
destroy.delete = (args: { tenant: string | { id: string }, user: string | { id: string } } | [tenant: string | { id: string }, user: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::destroy
* @see app/Http/Controllers/Admin/TenantController.php:514
* @route '/admin/tenants/{tenant}/users/{user}'
*/
const destroyForm = (args: { tenant: string | { id: string }, user: string | { id: string } } | [tenant: string | { id: string }, user: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::destroy
* @see app/Http/Controllers/Admin/TenantController.php:514
* @route '/admin/tenants/{tenant}/users/{user}'
*/
destroyForm.delete = (args: { tenant: string | { id: string }, user: string | { id: string } } | [tenant: string | { id: string }, user: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const users = {
    index: Object.assign(index, index),
    search: Object.assign(search, search),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default users