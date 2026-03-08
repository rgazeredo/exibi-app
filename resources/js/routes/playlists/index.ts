import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import items from './items'
/**
* @see \App\Http\Controllers\PlaylistController::index
* @see app/Http/Controllers/PlaylistController.php:21
* @route '/playlists'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/playlists',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlaylistController::index
* @see app/Http/Controllers/PlaylistController.php:21
* @route '/playlists'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::index
* @see app/Http/Controllers/PlaylistController.php:21
* @route '/playlists'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::index
* @see app/Http/Controllers/PlaylistController.php:21
* @route '/playlists'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlaylistController::index
* @see app/Http/Controllers/PlaylistController.php:21
* @route '/playlists'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::index
* @see app/Http/Controllers/PlaylistController.php:21
* @route '/playlists'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::index
* @see app/Http/Controllers/PlaylistController.php:21
* @route '/playlists'
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
* @see \App\Http\Controllers\PlaylistController::create
* @see app/Http/Controllers/PlaylistController.php:76
* @route '/playlists/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/playlists/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlaylistController::create
* @see app/Http/Controllers/PlaylistController.php:76
* @route '/playlists/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::create
* @see app/Http/Controllers/PlaylistController.php:76
* @route '/playlists/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::create
* @see app/Http/Controllers/PlaylistController.php:76
* @route '/playlists/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlaylistController::create
* @see app/Http/Controllers/PlaylistController.php:76
* @route '/playlists/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::create
* @see app/Http/Controllers/PlaylistController.php:76
* @route '/playlists/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::create
* @see app/Http/Controllers/PlaylistController.php:76
* @route '/playlists/create'
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
* @see \App\Http\Controllers\PlaylistController::store
* @see app/Http/Controllers/PlaylistController.php:81
* @route '/playlists'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/playlists',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlaylistController::store
* @see app/Http/Controllers/PlaylistController.php:81
* @route '/playlists'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::store
* @see app/Http/Controllers/PlaylistController.php:81
* @route '/playlists'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::store
* @see app/Http/Controllers/PlaylistController.php:81
* @route '/playlists'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::store
* @see app/Http/Controllers/PlaylistController.php:81
* @route '/playlists'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\PlaylistController::show
* @see app/Http/Controllers/PlaylistController.php:131
* @route '/playlists/{playlist}'
*/
export const show = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/playlists/{playlist}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlaylistController::show
* @see app/Http/Controllers/PlaylistController.php:131
* @route '/playlists/{playlist}'
*/
show.url = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { playlist: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { playlist: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            playlist: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        playlist: typeof args.playlist === 'object'
        ? args.playlist.id
        : args.playlist,
    }

    return show.definition.url
            .replace('{playlist}', parsedArgs.playlist.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::show
* @see app/Http/Controllers/PlaylistController.php:131
* @route '/playlists/{playlist}'
*/
show.get = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::show
* @see app/Http/Controllers/PlaylistController.php:131
* @route '/playlists/{playlist}'
*/
show.head = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlaylistController::show
* @see app/Http/Controllers/PlaylistController.php:131
* @route '/playlists/{playlist}'
*/
const showForm = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::show
* @see app/Http/Controllers/PlaylistController.php:131
* @route '/playlists/{playlist}'
*/
showForm.get = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::show
* @see app/Http/Controllers/PlaylistController.php:131
* @route '/playlists/{playlist}'
*/
showForm.head = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\PlaylistController::update
* @see app/Http/Controllers/PlaylistController.php:180
* @route '/playlists/{playlist}'
*/
export const update = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/playlists/{playlist}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\PlaylistController::update
* @see app/Http/Controllers/PlaylistController.php:180
* @route '/playlists/{playlist}'
*/
update.url = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { playlist: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { playlist: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            playlist: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        playlist: typeof args.playlist === 'object'
        ? args.playlist.id
        : args.playlist,
    }

    return update.definition.url
            .replace('{playlist}', parsedArgs.playlist.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::update
* @see app/Http/Controllers/PlaylistController.php:180
* @route '/playlists/{playlist}'
*/
update.put = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\PlaylistController::update
* @see app/Http/Controllers/PlaylistController.php:180
* @route '/playlists/{playlist}'
*/
update.patch = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\PlaylistController::update
* @see app/Http/Controllers/PlaylistController.php:180
* @route '/playlists/{playlist}'
*/
const updateForm = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::update
* @see app/Http/Controllers/PlaylistController.php:180
* @route '/playlists/{playlist}'
*/
updateForm.put = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::update
* @see app/Http/Controllers/PlaylistController.php:180
* @route '/playlists/{playlist}'
*/
updateForm.patch = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\PlaylistController::destroy
* @see app/Http/Controllers/PlaylistController.php:306
* @route '/playlists/{playlist}'
*/
export const destroy = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/playlists/{playlist}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PlaylistController::destroy
* @see app/Http/Controllers/PlaylistController.php:306
* @route '/playlists/{playlist}'
*/
destroy.url = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { playlist: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { playlist: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            playlist: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        playlist: typeof args.playlist === 'object'
        ? args.playlist.id
        : args.playlist,
    }

    return destroy.definition.url
            .replace('{playlist}', parsedArgs.playlist.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::destroy
* @see app/Http/Controllers/PlaylistController.php:306
* @route '/playlists/{playlist}'
*/
destroy.delete = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\PlaylistController::destroy
* @see app/Http/Controllers/PlaylistController.php:306
* @route '/playlists/{playlist}'
*/
const destroyForm = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::destroy
* @see app/Http/Controllers/PlaylistController.php:306
* @route '/playlists/{playlist}'
*/
destroyForm.delete = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\PlaylistController::search
* @see app/Http/Controllers/PlaylistController.php:28
* @route '/api/playlists/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/api/playlists/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlaylistController::search
* @see app/Http/Controllers/PlaylistController.php:28
* @route '/api/playlists/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::search
* @see app/Http/Controllers/PlaylistController.php:28
* @route '/api/playlists/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::search
* @see app/Http/Controllers/PlaylistController.php:28
* @route '/api/playlists/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlaylistController::search
* @see app/Http/Controllers/PlaylistController.php:28
* @route '/api/playlists/search'
*/
const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::search
* @see app/Http/Controllers/PlaylistController.php:28
* @route '/api/playlists/search'
*/
searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::search
* @see app/Http/Controllers/PlaylistController.php:28
* @route '/api/playlists/search'
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
* @see \App\Http\Controllers\PlaylistController::reorder
* @see app/Http/Controllers/PlaylistController.php:314
* @route '/playlists/{playlist}/reorder'
*/
export const reorder = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(args, options),
    method: 'post',
})

reorder.definition = {
    methods: ["post"],
    url: '/playlists/{playlist}/reorder',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlaylistController::reorder
* @see app/Http/Controllers/PlaylistController.php:314
* @route '/playlists/{playlist}/reorder'
*/
reorder.url = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { playlist: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { playlist: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            playlist: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        playlist: typeof args.playlist === 'object'
        ? args.playlist.id
        : args.playlist,
    }

    return reorder.definition.url
            .replace('{playlist}', parsedArgs.playlist.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::reorder
* @see app/Http/Controllers/PlaylistController.php:314
* @route '/playlists/{playlist}/reorder'
*/
reorder.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::reorder
* @see app/Http/Controllers/PlaylistController.php:314
* @route '/playlists/{playlist}/reorder'
*/
const reorderForm = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reorder.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::reorder
* @see app/Http/Controllers/PlaylistController.php:314
* @route '/playlists/{playlist}/reorder'
*/
reorderForm.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reorder.url(args, options),
    method: 'post',
})

reorder.form = reorderForm

/**
* @see \App\Http\Controllers\PlaylistController::duplicate
* @see app/Http/Controllers/PlaylistController.php:425
* @route '/playlists/{playlist}/duplicate'
*/
export const duplicate = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: duplicate.url(args, options),
    method: 'post',
})

duplicate.definition = {
    methods: ["post"],
    url: '/playlists/{playlist}/duplicate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlaylistController::duplicate
* @see app/Http/Controllers/PlaylistController.php:425
* @route '/playlists/{playlist}/duplicate'
*/
duplicate.url = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { playlist: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { playlist: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            playlist: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        playlist: typeof args.playlist === 'object'
        ? args.playlist.id
        : args.playlist,
    }

    return duplicate.definition.url
            .replace('{playlist}', parsedArgs.playlist.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::duplicate
* @see app/Http/Controllers/PlaylistController.php:425
* @route '/playlists/{playlist}/duplicate'
*/
duplicate.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: duplicate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::duplicate
* @see app/Http/Controllers/PlaylistController.php:425
* @route '/playlists/{playlist}/duplicate'
*/
const duplicateForm = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: duplicate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::duplicate
* @see app/Http/Controllers/PlaylistController.php:425
* @route '/playlists/{playlist}/duplicate'
*/
duplicateForm.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: duplicate.url(args, options),
    method: 'post',
})

duplicate.form = duplicateForm

/**
* @see \App\Http\Controllers\PlaylistController::preview
* @see app/Http/Controllers/PlaylistController.php:463
* @route '/playlists/{playlist}/preview'
*/
export const preview = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(args, options),
    method: 'get',
})

preview.definition = {
    methods: ["get","head"],
    url: '/playlists/{playlist}/preview',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlaylistController::preview
* @see app/Http/Controllers/PlaylistController.php:463
* @route '/playlists/{playlist}/preview'
*/
preview.url = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { playlist: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { playlist: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            playlist: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        playlist: typeof args.playlist === 'object'
        ? args.playlist.id
        : args.playlist,
    }

    return preview.definition.url
            .replace('{playlist}', parsedArgs.playlist.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::preview
* @see app/Http/Controllers/PlaylistController.php:463
* @route '/playlists/{playlist}/preview'
*/
preview.get = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::preview
* @see app/Http/Controllers/PlaylistController.php:463
* @route '/playlists/{playlist}/preview'
*/
preview.head = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: preview.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlaylistController::preview
* @see app/Http/Controllers/PlaylistController.php:463
* @route '/playlists/{playlist}/preview'
*/
const previewForm = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::preview
* @see app/Http/Controllers/PlaylistController.php:463
* @route '/playlists/{playlist}/preview'
*/
previewForm.get = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::preview
* @see app/Http/Controllers/PlaylistController.php:463
* @route '/playlists/{playlist}/preview'
*/
previewForm.head = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

preview.form = previewForm

/**
* @see \App\Http\Controllers\PlaylistController::refreshPlayers
* @see app/Http/Controllers/PlaylistController.php:525
* @route '/playlists/{playlist}/refresh-players'
*/
export const refreshPlayers = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshPlayers.url(args, options),
    method: 'post',
})

refreshPlayers.definition = {
    methods: ["post"],
    url: '/playlists/{playlist}/refresh-players',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlaylistController::refreshPlayers
* @see app/Http/Controllers/PlaylistController.php:525
* @route '/playlists/{playlist}/refresh-players'
*/
refreshPlayers.url = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { playlist: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { playlist: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            playlist: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        playlist: typeof args.playlist === 'object'
        ? args.playlist.id
        : args.playlist,
    }

    return refreshPlayers.definition.url
            .replace('{playlist}', parsedArgs.playlist.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::refreshPlayers
* @see app/Http/Controllers/PlaylistController.php:525
* @route '/playlists/{playlist}/refresh-players'
*/
refreshPlayers.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshPlayers.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::refreshPlayers
* @see app/Http/Controllers/PlaylistController.php:525
* @route '/playlists/{playlist}/refresh-players'
*/
const refreshPlayersForm = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: refreshPlayers.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::refreshPlayers
* @see app/Http/Controllers/PlaylistController.php:525
* @route '/playlists/{playlist}/refresh-players'
*/
refreshPlayersForm.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: refreshPlayers.url(args, options),
    method: 'post',
})

refreshPlayers.form = refreshPlayersForm

const playlists = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    search: Object.assign(search, search),
    items: Object.assign(items, items),
    reorder: Object.assign(reorder, reorder),
    duplicate: Object.assign(duplicate, duplicate),
    preview: Object.assign(preview, preview),
    refreshPlayers: Object.assign(refreshPlayers, refreshPlayers),
}

export default playlists