import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MediaController::index
* @see app/Http/Controllers/MediaController.php:23
* @route '/media'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/media',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MediaController::index
* @see app/Http/Controllers/MediaController.php:23
* @route '/media'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MediaController::index
* @see app/Http/Controllers/MediaController.php:23
* @route '/media'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::index
* @see app/Http/Controllers/MediaController.php:23
* @route '/media'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MediaController::index
* @see app/Http/Controllers/MediaController.php:23
* @route '/media'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::index
* @see app/Http/Controllers/MediaController.php:23
* @route '/media'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::index
* @see app/Http/Controllers/MediaController.php:23
* @route '/media'
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
* @see \App\Http\Controllers\MediaController::create
* @see app/Http/Controllers/MediaController.php:36
* @route '/media/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/media/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MediaController::create
* @see app/Http/Controllers/MediaController.php:36
* @route '/media/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MediaController::create
* @see app/Http/Controllers/MediaController.php:36
* @route '/media/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::create
* @see app/Http/Controllers/MediaController.php:36
* @route '/media/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MediaController::create
* @see app/Http/Controllers/MediaController.php:36
* @route '/media/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::create
* @see app/Http/Controllers/MediaController.php:36
* @route '/media/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::create
* @see app/Http/Controllers/MediaController.php:36
* @route '/media/create'
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
* @see \App\Http\Controllers\MediaController::store
* @see app/Http/Controllers/MediaController.php:41
* @route '/media'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/media',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MediaController::store
* @see app/Http/Controllers/MediaController.php:41
* @route '/media'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MediaController::store
* @see app/Http/Controllers/MediaController.php:41
* @route '/media'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MediaController::store
* @see app/Http/Controllers/MediaController.php:41
* @route '/media'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MediaController::store
* @see app/Http/Controllers/MediaController.php:41
* @route '/media'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\MediaController::show
* @see app/Http/Controllers/MediaController.php:103
* @route '/media/{medium}'
*/
export const show = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/media/{medium}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MediaController::show
* @see app/Http/Controllers/MediaController.php:103
* @route '/media/{medium}'
*/
show.url = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { medium: args }
    }

    if (Array.isArray(args)) {
        args = {
            medium: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        medium: args.medium,
    }

    return show.definition.url
            .replace('{medium}', parsedArgs.medium.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MediaController::show
* @see app/Http/Controllers/MediaController.php:103
* @route '/media/{medium}'
*/
show.get = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::show
* @see app/Http/Controllers/MediaController.php:103
* @route '/media/{medium}'
*/
show.head = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MediaController::show
* @see app/Http/Controllers/MediaController.php:103
* @route '/media/{medium}'
*/
const showForm = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::show
* @see app/Http/Controllers/MediaController.php:103
* @route '/media/{medium}'
*/
showForm.get = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::show
* @see app/Http/Controllers/MediaController.php:103
* @route '/media/{medium}'
*/
showForm.head = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\MediaController::edit
* @see app/Http/Controllers/MediaController.php:149
* @route '/media/{medium}/edit'
*/
export const edit = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/media/{medium}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MediaController::edit
* @see app/Http/Controllers/MediaController.php:149
* @route '/media/{medium}/edit'
*/
edit.url = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { medium: args }
    }

    if (Array.isArray(args)) {
        args = {
            medium: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        medium: args.medium,
    }

    return edit.definition.url
            .replace('{medium}', parsedArgs.medium.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MediaController::edit
* @see app/Http/Controllers/MediaController.php:149
* @route '/media/{medium}/edit'
*/
edit.get = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::edit
* @see app/Http/Controllers/MediaController.php:149
* @route '/media/{medium}/edit'
*/
edit.head = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MediaController::edit
* @see app/Http/Controllers/MediaController.php:149
* @route '/media/{medium}/edit'
*/
const editForm = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::edit
* @see app/Http/Controllers/MediaController.php:149
* @route '/media/{medium}/edit'
*/
editForm.get = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::edit
* @see app/Http/Controllers/MediaController.php:149
* @route '/media/{medium}/edit'
*/
editForm.head = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\MediaController::update
* @see app/Http/Controllers/MediaController.php:162
* @route '/media/{medium}'
*/
export const update = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/media/{medium}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\MediaController::update
* @see app/Http/Controllers/MediaController.php:162
* @route '/media/{medium}'
*/
update.url = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { medium: args }
    }

    if (Array.isArray(args)) {
        args = {
            medium: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        medium: args.medium,
    }

    return update.definition.url
            .replace('{medium}', parsedArgs.medium.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MediaController::update
* @see app/Http/Controllers/MediaController.php:162
* @route '/media/{medium}'
*/
update.put = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\MediaController::update
* @see app/Http/Controllers/MediaController.php:162
* @route '/media/{medium}'
*/
update.patch = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\MediaController::update
* @see app/Http/Controllers/MediaController.php:162
* @route '/media/{medium}'
*/
const updateForm = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MediaController::update
* @see app/Http/Controllers/MediaController.php:162
* @route '/media/{medium}'
*/
updateForm.put = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MediaController::update
* @see app/Http/Controllers/MediaController.php:162
* @route '/media/{medium}'
*/
updateForm.patch = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\MediaController::destroy
* @see app/Http/Controllers/MediaController.php:193
* @route '/media/{medium}'
*/
export const destroy = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/media/{medium}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\MediaController::destroy
* @see app/Http/Controllers/MediaController.php:193
* @route '/media/{medium}'
*/
destroy.url = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { medium: args }
    }

    if (Array.isArray(args)) {
        args = {
            medium: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        medium: args.medium,
    }

    return destroy.definition.url
            .replace('{medium}', parsedArgs.medium.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MediaController::destroy
* @see app/Http/Controllers/MediaController.php:193
* @route '/media/{medium}'
*/
destroy.delete = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\MediaController::destroy
* @see app/Http/Controllers/MediaController.php:193
* @route '/media/{medium}'
*/
const destroyForm = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MediaController::destroy
* @see app/Http/Controllers/MediaController.php:193
* @route '/media/{medium}'
*/
destroyForm.delete = (args: { medium: string | number } | [medium: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\MediaController::search
* @see app/Http/Controllers/MediaController.php:217
* @route '/api/media/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/api/media/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MediaController::search
* @see app/Http/Controllers/MediaController.php:217
* @route '/api/media/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MediaController::search
* @see app/Http/Controllers/MediaController.php:217
* @route '/api/media/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::search
* @see app/Http/Controllers/MediaController.php:217
* @route '/api/media/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MediaController::search
* @see app/Http/Controllers/MediaController.php:217
* @route '/api/media/search'
*/
const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::search
* @see app/Http/Controllers/MediaController.php:217
* @route '/api/media/search'
*/
searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::search
* @see app/Http/Controllers/MediaController.php:217
* @route '/api/media/search'
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
* @see \App\Http\Controllers\MediaController::stats
* @see app/Http/Controllers/MediaController.php:298
* @route '/api/media/stats'
*/
export const stats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/api/media/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MediaController::stats
* @see app/Http/Controllers/MediaController.php:298
* @route '/api/media/stats'
*/
stats.url = (options?: RouteQueryOptions) => {
    return stats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MediaController::stats
* @see app/Http/Controllers/MediaController.php:298
* @route '/api/media/stats'
*/
stats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::stats
* @see app/Http/Controllers/MediaController.php:298
* @route '/api/media/stats'
*/
stats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MediaController::stats
* @see app/Http/Controllers/MediaController.php:298
* @route '/api/media/stats'
*/
const statsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: stats.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::stats
* @see app/Http/Controllers/MediaController.php:298
* @route '/api/media/stats'
*/
statsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: stats.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::stats
* @see app/Http/Controllers/MediaController.php:298
* @route '/api/media/stats'
*/
statsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: stats.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

stats.form = statsForm

/**
* @see \App\Http\Controllers\MediaController::move
* @see app/Http/Controllers/MediaController.php:311
* @route '/api/media/move'
*/
export const move = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: move.url(options),
    method: 'post',
})

move.definition = {
    methods: ["post"],
    url: '/api/media/move',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MediaController::move
* @see app/Http/Controllers/MediaController.php:311
* @route '/api/media/move'
*/
move.url = (options?: RouteQueryOptions) => {
    return move.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MediaController::move
* @see app/Http/Controllers/MediaController.php:311
* @route '/api/media/move'
*/
move.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: move.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MediaController::move
* @see app/Http/Controllers/MediaController.php:311
* @route '/api/media/move'
*/
const moveForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: move.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MediaController::move
* @see app/Http/Controllers/MediaController.php:311
* @route '/api/media/move'
*/
moveForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: move.url(options),
    method: 'post',
})

move.form = moveForm

/**
* @see \App\Http\Controllers\MediaController::bulkDelete
* @see app/Http/Controllers/MediaController.php:322
* @route '/api/media/bulk-delete'
*/
export const bulkDelete = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDelete.url(options),
    method: 'post',
})

bulkDelete.definition = {
    methods: ["post"],
    url: '/api/media/bulk-delete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MediaController::bulkDelete
* @see app/Http/Controllers/MediaController.php:322
* @route '/api/media/bulk-delete'
*/
bulkDelete.url = (options?: RouteQueryOptions) => {
    return bulkDelete.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MediaController::bulkDelete
* @see app/Http/Controllers/MediaController.php:322
* @route '/api/media/bulk-delete'
*/
bulkDelete.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDelete.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MediaController::bulkDelete
* @see app/Http/Controllers/MediaController.php:322
* @route '/api/media/bulk-delete'
*/
const bulkDeleteForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: bulkDelete.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MediaController::bulkDelete
* @see app/Http/Controllers/MediaController.php:322
* @route '/api/media/bulk-delete'
*/
bulkDeleteForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: bulkDelete.url(options),
    method: 'post',
})

bulkDelete.form = bulkDeleteForm

/**
* @see \App\Http\Controllers\MediaController::apiShow
* @see app/Http/Controllers/MediaController.php:283
* @route '/api/media/{media}'
*/
export const apiShow = (args: { media: string | { id: string } } | [media: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: apiShow.url(args, options),
    method: 'get',
})

apiShow.definition = {
    methods: ["get","head"],
    url: '/api/media/{media}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MediaController::apiShow
* @see app/Http/Controllers/MediaController.php:283
* @route '/api/media/{media}'
*/
apiShow.url = (args: { media: string | { id: string } } | [media: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { media: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { media: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            media: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        media: typeof args.media === 'object'
        ? args.media.id
        : args.media,
    }

    return apiShow.definition.url
            .replace('{media}', parsedArgs.media.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MediaController::apiShow
* @see app/Http/Controllers/MediaController.php:283
* @route '/api/media/{media}'
*/
apiShow.get = (args: { media: string | { id: string } } | [media: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: apiShow.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::apiShow
* @see app/Http/Controllers/MediaController.php:283
* @route '/api/media/{media}'
*/
apiShow.head = (args: { media: string | { id: string } } | [media: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: apiShow.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MediaController::apiShow
* @see app/Http/Controllers/MediaController.php:283
* @route '/api/media/{media}'
*/
const apiShowForm = (args: { media: string | { id: string } } | [media: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: apiShow.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::apiShow
* @see app/Http/Controllers/MediaController.php:283
* @route '/api/media/{media}'
*/
apiShowForm.get = (args: { media: string | { id: string } } | [media: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: apiShow.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::apiShow
* @see app/Http/Controllers/MediaController.php:283
* @route '/api/media/{media}'
*/
apiShowForm.head = (args: { media: string | { id: string } } | [media: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: apiShow.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

apiShow.form = apiShowForm

/**
* @see \App\Http\Controllers\MediaController::replace
* @see app/Http/Controllers/MediaController.php:393
* @route '/media/{media}/replace'
*/
export const replace = (args: { media: string | number } | [media: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: replace.url(args, options),
    method: 'post',
})

replace.definition = {
    methods: ["post"],
    url: '/media/{media}/replace',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MediaController::replace
* @see app/Http/Controllers/MediaController.php:393
* @route '/media/{media}/replace'
*/
replace.url = (args: { media: string | number } | [media: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { media: args }
    }

    if (Array.isArray(args)) {
        args = {
            media: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        media: args.media,
    }

    return replace.definition.url
            .replace('{media}', parsedArgs.media.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MediaController::replace
* @see app/Http/Controllers/MediaController.php:393
* @route '/media/{media}/replace'
*/
replace.post = (args: { media: string | number } | [media: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: replace.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MediaController::replace
* @see app/Http/Controllers/MediaController.php:393
* @route '/media/{media}/replace'
*/
const replaceForm = (args: { media: string | number } | [media: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: replace.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MediaController::replace
* @see app/Http/Controllers/MediaController.php:393
* @route '/media/{media}/replace'
*/
replaceForm.post = (args: { media: string | number } | [media: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: replace.url(args, options),
    method: 'post',
})

replace.form = replaceForm

const MediaController = { index, create, store, show, edit, update, destroy, search, stats, move, bulkDelete, apiShow, replace }

export default MediaController