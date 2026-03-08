import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AppReleaseController::index
* @see app/Http/Controllers/Admin/AppReleaseController.php:16
* @route '/admin/releases'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/releases',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::index
* @see app/Http/Controllers/Admin/AppReleaseController.php:16
* @route '/admin/releases'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::index
* @see app/Http/Controllers/Admin/AppReleaseController.php:16
* @route '/admin/releases'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::index
* @see app/Http/Controllers/Admin/AppReleaseController.php:16
* @route '/admin/releases'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::index
* @see app/Http/Controllers/Admin/AppReleaseController.php:16
* @route '/admin/releases'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::index
* @see app/Http/Controllers/Admin/AppReleaseController.php:16
* @route '/admin/releases'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::index
* @see app/Http/Controllers/Admin/AppReleaseController.php:16
* @route '/admin/releases'
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
* @see \App\Http\Controllers\Admin\AppReleaseController::create
* @see app/Http/Controllers/Admin/AppReleaseController.php:48
* @route '/admin/releases/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/releases/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::create
* @see app/Http/Controllers/Admin/AppReleaseController.php:48
* @route '/admin/releases/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::create
* @see app/Http/Controllers/Admin/AppReleaseController.php:48
* @route '/admin/releases/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::create
* @see app/Http/Controllers/Admin/AppReleaseController.php:48
* @route '/admin/releases/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::create
* @see app/Http/Controllers/Admin/AppReleaseController.php:48
* @route '/admin/releases/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::create
* @see app/Http/Controllers/Admin/AppReleaseController.php:48
* @route '/admin/releases/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::create
* @see app/Http/Controllers/Admin/AppReleaseController.php:48
* @route '/admin/releases/create'
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
* @see \App\Http\Controllers\Admin\AppReleaseController::store
* @see app/Http/Controllers/Admin/AppReleaseController.php:60
* @route '/admin/releases'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/releases',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::store
* @see app/Http/Controllers/Admin/AppReleaseController.php:60
* @route '/admin/releases'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::store
* @see app/Http/Controllers/Admin/AppReleaseController.php:60
* @route '/admin/releases'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::store
* @see app/Http/Controllers/Admin/AppReleaseController.php:60
* @route '/admin/releases'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::store
* @see app/Http/Controllers/Admin/AppReleaseController.php:60
* @route '/admin/releases'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::edit
* @see app/Http/Controllers/Admin/AppReleaseController.php:141
* @route '/admin/releases/{release}/edit'
*/
export const edit = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/releases/{release}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::edit
* @see app/Http/Controllers/Admin/AppReleaseController.php:141
* @route '/admin/releases/{release}/edit'
*/
edit.url = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { release: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { release: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            release: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        release: typeof args.release === 'object'
        ? args.release.id
        : args.release,
    }

    return edit.definition.url
            .replace('{release}', parsedArgs.release.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::edit
* @see app/Http/Controllers/Admin/AppReleaseController.php:141
* @route '/admin/releases/{release}/edit'
*/
edit.get = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::edit
* @see app/Http/Controllers/Admin/AppReleaseController.php:141
* @route '/admin/releases/{release}/edit'
*/
edit.head = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::edit
* @see app/Http/Controllers/Admin/AppReleaseController.php:141
* @route '/admin/releases/{release}/edit'
*/
const editForm = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::edit
* @see app/Http/Controllers/Admin/AppReleaseController.php:141
* @route '/admin/releases/{release}/edit'
*/
editForm.get = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::edit
* @see app/Http/Controllers/Admin/AppReleaseController.php:141
* @route '/admin/releases/{release}/edit'
*/
editForm.head = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\AppReleaseController::update
* @see app/Http/Controllers/Admin/AppReleaseController.php:160
* @route '/admin/releases/{release}'
*/
export const update = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/releases/{release}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::update
* @see app/Http/Controllers/Admin/AppReleaseController.php:160
* @route '/admin/releases/{release}'
*/
update.url = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { release: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { release: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            release: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        release: typeof args.release === 'object'
        ? args.release.id
        : args.release,
    }

    return update.definition.url
            .replace('{release}', parsedArgs.release.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::update
* @see app/Http/Controllers/Admin/AppReleaseController.php:160
* @route '/admin/releases/{release}'
*/
update.put = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::update
* @see app/Http/Controllers/Admin/AppReleaseController.php:160
* @route '/admin/releases/{release}'
*/
update.patch = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::update
* @see app/Http/Controllers/Admin/AppReleaseController.php:160
* @route '/admin/releases/{release}'
*/
const updateForm = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::update
* @see app/Http/Controllers/Admin/AppReleaseController.php:160
* @route '/admin/releases/{release}'
*/
updateForm.put = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::update
* @see app/Http/Controllers/Admin/AppReleaseController.php:160
* @route '/admin/releases/{release}'
*/
updateForm.patch = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\AppReleaseController::destroy
* @see app/Http/Controllers/Admin/AppReleaseController.php:183
* @route '/admin/releases/{release}'
*/
export const destroy = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/releases/{release}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::destroy
* @see app/Http/Controllers/Admin/AppReleaseController.php:183
* @route '/admin/releases/{release}'
*/
destroy.url = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { release: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { release: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            release: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        release: typeof args.release === 'object'
        ? args.release.id
        : args.release,
    }

    return destroy.definition.url
            .replace('{release}', parsedArgs.release.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::destroy
* @see app/Http/Controllers/Admin/AppReleaseController.php:183
* @route '/admin/releases/{release}'
*/
destroy.delete = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::destroy
* @see app/Http/Controllers/Admin/AppReleaseController.php:183
* @route '/admin/releases/{release}'
*/
const destroyForm = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::destroy
* @see app/Http/Controllers/Admin/AppReleaseController.php:183
* @route '/admin/releases/{release}'
*/
destroyForm.delete = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\AppReleaseController::activate
* @see app/Http/Controllers/Admin/AppReleaseController.php:206
* @route '/admin/releases/{release}/activate'
*/
export const activate = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activate.url(args, options),
    method: 'post',
})

activate.definition = {
    methods: ["post"],
    url: '/admin/releases/{release}/activate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::activate
* @see app/Http/Controllers/Admin/AppReleaseController.php:206
* @route '/admin/releases/{release}/activate'
*/
activate.url = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { release: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { release: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            release: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        release: typeof args.release === 'object'
        ? args.release.id
        : args.release,
    }

    return activate.definition.url
            .replace('{release}', parsedArgs.release.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::activate
* @see app/Http/Controllers/Admin/AppReleaseController.php:206
* @route '/admin/releases/{release}/activate'
*/
activate.post = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::activate
* @see app/Http/Controllers/Admin/AppReleaseController.php:206
* @route '/admin/releases/{release}/activate'
*/
const activateForm = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: activate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AppReleaseController::activate
* @see app/Http/Controllers/Admin/AppReleaseController.php:206
* @route '/admin/releases/{release}/activate'
*/
activateForm.post = (args: { release: string | { id: string } } | [release: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: activate.url(args, options),
    method: 'post',
})

activate.form = activateForm

const releases = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    activate: Object.assign(activate, activate),
}

export default releases