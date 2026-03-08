import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\TenantController::index
* @see app/Http/Controllers/Admin/TenantController.php:23
* @route '/admin/tenants'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/tenants',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::index
* @see app/Http/Controllers/Admin/TenantController.php:23
* @route '/admin/tenants'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::index
* @see app/Http/Controllers/Admin/TenantController.php:23
* @route '/admin/tenants'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::index
* @see app/Http/Controllers/Admin/TenantController.php:23
* @route '/admin/tenants'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::index
* @see app/Http/Controllers/Admin/TenantController.php:23
* @route '/admin/tenants'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::index
* @see app/Http/Controllers/Admin/TenantController.php:23
* @route '/admin/tenants'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::index
* @see app/Http/Controllers/Admin/TenantController.php:23
* @route '/admin/tenants'
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
* @see \App\Http\Controllers\Admin\TenantController::create
* @see app/Http/Controllers/Admin/TenantController.php:95
* @route '/admin/tenants/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/tenants/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::create
* @see app/Http/Controllers/Admin/TenantController.php:95
* @route '/admin/tenants/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::create
* @see app/Http/Controllers/Admin/TenantController.php:95
* @route '/admin/tenants/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::create
* @see app/Http/Controllers/Admin/TenantController.php:95
* @route '/admin/tenants/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::create
* @see app/Http/Controllers/Admin/TenantController.php:95
* @route '/admin/tenants/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::create
* @see app/Http/Controllers/Admin/TenantController.php:95
* @route '/admin/tenants/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::create
* @see app/Http/Controllers/Admin/TenantController.php:95
* @route '/admin/tenants/create'
*/
createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url({
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
* @see app/Http/Controllers/Admin/TenantController.php:102
* @route '/admin/tenants'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/tenants',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::store
* @see app/Http/Controllers/Admin/TenantController.php:102
* @route '/admin/tenants'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::store
* @see app/Http/Controllers/Admin/TenantController.php:102
* @route '/admin/tenants'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::store
* @see app/Http/Controllers/Admin/TenantController.php:102
* @route '/admin/tenants'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::store
* @see app/Http/Controllers/Admin/TenantController.php:102
* @route '/admin/tenants'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\TenantController::edit
* @see app/Http/Controllers/Admin/TenantController.php:192
* @route '/admin/tenants/{tenant}/edit'
*/
export const edit = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/tenants/{tenant}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::edit
* @see app/Http/Controllers/Admin/TenantController.php:192
* @route '/admin/tenants/{tenant}/edit'
*/
edit.url = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return edit.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::edit
* @see app/Http/Controllers/Admin/TenantController.php:192
* @route '/admin/tenants/{tenant}/edit'
*/
edit.get = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::edit
* @see app/Http/Controllers/Admin/TenantController.php:192
* @route '/admin/tenants/{tenant}/edit'
*/
edit.head = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::edit
* @see app/Http/Controllers/Admin/TenantController.php:192
* @route '/admin/tenants/{tenant}/edit'
*/
const editForm = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::edit
* @see app/Http/Controllers/Admin/TenantController.php:192
* @route '/admin/tenants/{tenant}/edit'
*/
editForm.get = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::edit
* @see app/Http/Controllers/Admin/TenantController.php:192
* @route '/admin/tenants/{tenant}/edit'
*/
editForm.head = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\Admin\TenantController::update
* @see app/Http/Controllers/Admin/TenantController.php:210
* @route '/admin/tenants/{tenant}'
*/
export const update = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/tenants/{tenant}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::update
* @see app/Http/Controllers/Admin/TenantController.php:210
* @route '/admin/tenants/{tenant}'
*/
update.url = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::update
* @see app/Http/Controllers/Admin/TenantController.php:210
* @route '/admin/tenants/{tenant}'
*/
update.put = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::update
* @see app/Http/Controllers/Admin/TenantController.php:210
* @route '/admin/tenants/{tenant}'
*/
update.patch = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::update
* @see app/Http/Controllers/Admin/TenantController.php:210
* @route '/admin/tenants/{tenant}'
*/
const updateForm = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::update
* @see app/Http/Controllers/Admin/TenantController.php:210
* @route '/admin/tenants/{tenant}'
*/
updateForm.put = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::update
* @see app/Http/Controllers/Admin/TenantController.php:210
* @route '/admin/tenants/{tenant}'
*/
updateForm.patch = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Admin\TenantController::destroy
* @see app/Http/Controllers/Admin/TenantController.php:237
* @route '/admin/tenants/{tenant}'
*/
export const destroy = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/tenants/{tenant}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::destroy
* @see app/Http/Controllers/Admin/TenantController.php:237
* @route '/admin/tenants/{tenant}'
*/
destroy.url = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::destroy
* @see app/Http/Controllers/Admin/TenantController.php:237
* @route '/admin/tenants/{tenant}'
*/
destroy.delete = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::destroy
* @see app/Http/Controllers/Admin/TenantController.php:237
* @route '/admin/tenants/{tenant}'
*/
const destroyForm = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Admin/TenantController.php:237
* @route '/admin/tenants/{tenant}'
*/
destroyForm.delete = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\Admin\TenantController::search
* @see app/Http/Controllers/Admin/TenantController.php:30
* @route '/admin/api/tenants/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/admin/api/tenants/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::search
* @see app/Http/Controllers/Admin/TenantController.php:30
* @route '/admin/api/tenants/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::search
* @see app/Http/Controllers/Admin/TenantController.php:30
* @route '/admin/api/tenants/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::search
* @see app/Http/Controllers/Admin/TenantController.php:30
* @route '/admin/api/tenants/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::search
* @see app/Http/Controllers/Admin/TenantController.php:30
* @route '/admin/api/tenants/search'
*/
const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::search
* @see app/Http/Controllers/Admin/TenantController.php:30
* @route '/admin/api/tenants/search'
*/
searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::search
* @see app/Http/Controllers/Admin/TenantController.php:30
* @route '/admin/api/tenants/search'
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
* @see \App\Http\Controllers\Admin\TenantController::toggleStatus
* @see app/Http/Controllers/Admin/TenantController.php:366
* @route '/admin/tenants/{tenant}/toggle-status'
*/
export const toggleStatus = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleStatus.url(args, options),
    method: 'post',
})

toggleStatus.definition = {
    methods: ["post"],
    url: '/admin/tenants/{tenant}/toggle-status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::toggleStatus
* @see app/Http/Controllers/Admin/TenantController.php:366
* @route '/admin/tenants/{tenant}/toggle-status'
*/
toggleStatus.url = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return toggleStatus.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::toggleStatus
* @see app/Http/Controllers/Admin/TenantController.php:366
* @route '/admin/tenants/{tenant}/toggle-status'
*/
toggleStatus.post = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleStatus.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::toggleStatus
* @see app/Http/Controllers/Admin/TenantController.php:366
* @route '/admin/tenants/{tenant}/toggle-status'
*/
const toggleStatusForm = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleStatus.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::toggleStatus
* @see app/Http/Controllers/Admin/TenantController.php:366
* @route '/admin/tenants/{tenant}/toggle-status'
*/
toggleStatusForm.post = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleStatus.url(args, options),
    method: 'post',
})

toggleStatus.form = toggleStatusForm

/**
* @see \App\Http\Controllers\Admin\TenantController::users
* @see app/Http/Controllers/Admin/TenantController.php:377
* @route '/admin/tenants/{tenant}/users'
*/
export const users = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: users.url(args, options),
    method: 'get',
})

users.definition = {
    methods: ["get","head"],
    url: '/admin/tenants/{tenant}/users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::users
* @see app/Http/Controllers/Admin/TenantController.php:377
* @route '/admin/tenants/{tenant}/users'
*/
users.url = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return users.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::users
* @see app/Http/Controllers/Admin/TenantController.php:377
* @route '/admin/tenants/{tenant}/users'
*/
users.get = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: users.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::users
* @see app/Http/Controllers/Admin/TenantController.php:377
* @route '/admin/tenants/{tenant}/users'
*/
users.head = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: users.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::users
* @see app/Http/Controllers/Admin/TenantController.php:377
* @route '/admin/tenants/{tenant}/users'
*/
const usersForm = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: users.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::users
* @see app/Http/Controllers/Admin/TenantController.php:377
* @route '/admin/tenants/{tenant}/users'
*/
usersForm.get = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: users.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::users
* @see app/Http/Controllers/Admin/TenantController.php:377
* @route '/admin/tenants/{tenant}/users'
*/
usersForm.head = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: users.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

users.form = usersForm

/**
* @see \App\Http\Controllers\Admin\TenantController::searchUsers
* @see app/Http/Controllers/Admin/TenantController.php:389
* @route '/admin/api/tenants/{tenant}/users/search'
*/
export const searchUsers = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: searchUsers.url(args, options),
    method: 'get',
})

searchUsers.definition = {
    methods: ["get","head"],
    url: '/admin/api/tenants/{tenant}/users/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::searchUsers
* @see app/Http/Controllers/Admin/TenantController.php:389
* @route '/admin/api/tenants/{tenant}/users/search'
*/
searchUsers.url = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return searchUsers.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::searchUsers
* @see app/Http/Controllers/Admin/TenantController.php:389
* @route '/admin/api/tenants/{tenant}/users/search'
*/
searchUsers.get = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: searchUsers.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::searchUsers
* @see app/Http/Controllers/Admin/TenantController.php:389
* @route '/admin/api/tenants/{tenant}/users/search'
*/
searchUsers.head = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: searchUsers.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::searchUsers
* @see app/Http/Controllers/Admin/TenantController.php:389
* @route '/admin/api/tenants/{tenant}/users/search'
*/
const searchUsersForm = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: searchUsers.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::searchUsers
* @see app/Http/Controllers/Admin/TenantController.php:389
* @route '/admin/api/tenants/{tenant}/users/search'
*/
searchUsersForm.get = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: searchUsers.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::searchUsers
* @see app/Http/Controllers/Admin/TenantController.php:389
* @route '/admin/api/tenants/{tenant}/users/search'
*/
searchUsersForm.head = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: searchUsers.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

searchUsers.form = searchUsersForm

/**
* @see \App\Http\Controllers\Admin\TenantController::createUser
* @see app/Http/Controllers/Admin/TenantController.php:449
* @route '/admin/tenants/{tenant}/users/create'
*/
export const createUser = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createUser.url(args, options),
    method: 'get',
})

createUser.definition = {
    methods: ["get","head"],
    url: '/admin/tenants/{tenant}/users/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::createUser
* @see app/Http/Controllers/Admin/TenantController.php:449
* @route '/admin/tenants/{tenant}/users/create'
*/
createUser.url = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return createUser.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::createUser
* @see app/Http/Controllers/Admin/TenantController.php:449
* @route '/admin/tenants/{tenant}/users/create'
*/
createUser.get = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createUser.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::createUser
* @see app/Http/Controllers/Admin/TenantController.php:449
* @route '/admin/tenants/{tenant}/users/create'
*/
createUser.head = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: createUser.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::createUser
* @see app/Http/Controllers/Admin/TenantController.php:449
* @route '/admin/tenants/{tenant}/users/create'
*/
const createUserForm = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: createUser.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::createUser
* @see app/Http/Controllers/Admin/TenantController.php:449
* @route '/admin/tenants/{tenant}/users/create'
*/
createUserForm.get = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: createUser.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::createUser
* @see app/Http/Controllers/Admin/TenantController.php:449
* @route '/admin/tenants/{tenant}/users/create'
*/
createUserForm.head = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: createUser.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

createUser.form = createUserForm

/**
* @see \App\Http\Controllers\Admin\TenantController::storeUser
* @see app/Http/Controllers/Admin/TenantController.php:461
* @route '/admin/tenants/{tenant}/users'
*/
export const storeUser = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeUser.url(args, options),
    method: 'post',
})

storeUser.definition = {
    methods: ["post"],
    url: '/admin/tenants/{tenant}/users',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::storeUser
* @see app/Http/Controllers/Admin/TenantController.php:461
* @route '/admin/tenants/{tenant}/users'
*/
storeUser.url = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return storeUser.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::storeUser
* @see app/Http/Controllers/Admin/TenantController.php:461
* @route '/admin/tenants/{tenant}/users'
*/
storeUser.post = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeUser.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::storeUser
* @see app/Http/Controllers/Admin/TenantController.php:461
* @route '/admin/tenants/{tenant}/users'
*/
const storeUserForm = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeUser.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::storeUser
* @see app/Http/Controllers/Admin/TenantController.php:461
* @route '/admin/tenants/{tenant}/users'
*/
storeUserForm.post = (args: { tenant: string | { id: string } } | [tenant: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeUser.url(args, options),
    method: 'post',
})

storeUser.form = storeUserForm

/**
* @see \App\Http\Controllers\Admin\TenantController::destroyUser
* @see app/Http/Controllers/Admin/TenantController.php:517
* @route '/admin/tenants/{tenant}/users/{user}'
*/
export const destroyUser = (args: { tenant: string | { id: string }, user: string | { id: string } } | [tenant: string | { id: string }, user: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyUser.url(args, options),
    method: 'delete',
})

destroyUser.definition = {
    methods: ["delete"],
    url: '/admin/tenants/{tenant}/users/{user}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\TenantController::destroyUser
* @see app/Http/Controllers/Admin/TenantController.php:517
* @route '/admin/tenants/{tenant}/users/{user}'
*/
destroyUser.url = (args: { tenant: string | { id: string }, user: string | { id: string } } | [tenant: string | { id: string }, user: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return destroyUser.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TenantController::destroyUser
* @see app/Http/Controllers/Admin/TenantController.php:517
* @route '/admin/tenants/{tenant}/users/{user}'
*/
destroyUser.delete = (args: { tenant: string | { id: string }, user: string | { id: string } } | [tenant: string | { id: string }, user: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyUser.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::destroyUser
* @see app/Http/Controllers/Admin/TenantController.php:517
* @route '/admin/tenants/{tenant}/users/{user}'
*/
const destroyUserForm = (args: { tenant: string | { id: string }, user: string | { id: string } } | [tenant: string | { id: string }, user: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyUser.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TenantController::destroyUser
* @see app/Http/Controllers/Admin/TenantController.php:517
* @route '/admin/tenants/{tenant}/users/{user}'
*/
destroyUserForm.delete = (args: { tenant: string | { id: string }, user: string | { id: string } } | [tenant: string | { id: string }, user: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyUser.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyUser.form = destroyUserForm

const TenantController = { index, create, store, edit, update, destroy, search, toggleStatus, users, searchUsers, createUser, storeUser, destroyUser }

export default TenantController