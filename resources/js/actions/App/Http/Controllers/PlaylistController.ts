import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
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
* @see app/Http/Controllers/PlaylistController.php:179
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
* @see app/Http/Controllers/PlaylistController.php:179
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
* @see app/Http/Controllers/PlaylistController.php:179
* @route '/playlists/{playlist}'
*/
update.put = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\PlaylistController::update
* @see app/Http/Controllers/PlaylistController.php:179
* @route '/playlists/{playlist}'
*/
update.patch = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\PlaylistController::update
* @see app/Http/Controllers/PlaylistController.php:179
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
* @see app/Http/Controllers/PlaylistController.php:179
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
* @see app/Http/Controllers/PlaylistController.php:179
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
* @see app/Http/Controllers/PlaylistController.php:305
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
* @see app/Http/Controllers/PlaylistController.php:305
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
* @see app/Http/Controllers/PlaylistController.php:305
* @route '/playlists/{playlist}'
*/
destroy.delete = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\PlaylistController::destroy
* @see app/Http/Controllers/PlaylistController.php:305
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
* @see app/Http/Controllers/PlaylistController.php:305
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
* @see \App\Http\Controllers\PlaylistController::updateItems
* @see app/Http/Controllers/PlaylistController.php:213
* @route '/playlists/{playlist}/items'
*/
export const updateItems = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateItems.url(args, options),
    method: 'put',
})

updateItems.definition = {
    methods: ["put"],
    url: '/playlists/{playlist}/items',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PlaylistController::updateItems
* @see app/Http/Controllers/PlaylistController.php:213
* @route '/playlists/{playlist}/items'
*/
updateItems.url = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return updateItems.definition.url
            .replace('{playlist}', parsedArgs.playlist.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::updateItems
* @see app/Http/Controllers/PlaylistController.php:213
* @route '/playlists/{playlist}/items'
*/
updateItems.put = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateItems.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\PlaylistController::updateItems
* @see app/Http/Controllers/PlaylistController.php:213
* @route '/playlists/{playlist}/items'
*/
const updateItemsForm = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateItems.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::updateItems
* @see app/Http/Controllers/PlaylistController.php:213
* @route '/playlists/{playlist}/items'
*/
updateItemsForm.put = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateItems.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateItems.form = updateItemsForm

/**
* @see \App\Http\Controllers\PlaylistController::addItem
* @see app/Http/Controllers/PlaylistController.php:346
* @route '/playlists/{playlist}/items'
*/
export const addItem = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addItem.url(args, options),
    method: 'post',
})

addItem.definition = {
    methods: ["post"],
    url: '/playlists/{playlist}/items',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlaylistController::addItem
* @see app/Http/Controllers/PlaylistController.php:346
* @route '/playlists/{playlist}/items'
*/
addItem.url = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return addItem.definition.url
            .replace('{playlist}', parsedArgs.playlist.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::addItem
* @see app/Http/Controllers/PlaylistController.php:346
* @route '/playlists/{playlist}/items'
*/
addItem.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addItem.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::addItem
* @see app/Http/Controllers/PlaylistController.php:346
* @route '/playlists/{playlist}/items'
*/
const addItemForm = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: addItem.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::addItem
* @see app/Http/Controllers/PlaylistController.php:346
* @route '/playlists/{playlist}/items'
*/
addItemForm.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: addItem.url(args, options),
    method: 'post',
})

addItem.form = addItemForm

/**
* @see \App\Http\Controllers\PlaylistController::removeItem
* @see app/Http/Controllers/PlaylistController.php:407
* @route '/playlists/{playlist}/items/{item}'
*/
export const removeItem = (args: { playlist: string | { id: string }, item: string | { id: string } } | [playlist: string | { id: string }, item: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeItem.url(args, options),
    method: 'delete',
})

removeItem.definition = {
    methods: ["delete"],
    url: '/playlists/{playlist}/items/{item}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PlaylistController::removeItem
* @see app/Http/Controllers/PlaylistController.php:407
* @route '/playlists/{playlist}/items/{item}'
*/
removeItem.url = (args: { playlist: string | { id: string }, item: string | { id: string } } | [playlist: string | { id: string }, item: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            playlist: args[0],
            item: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        playlist: typeof args.playlist === 'object'
        ? args.playlist.id
        : args.playlist,
        item: typeof args.item === 'object'
        ? args.item.id
        : args.item,
    }

    return removeItem.definition.url
            .replace('{playlist}', parsedArgs.playlist.toString())
            .replace('{item}', parsedArgs.item.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::removeItem
* @see app/Http/Controllers/PlaylistController.php:407
* @route '/playlists/{playlist}/items/{item}'
*/
removeItem.delete = (args: { playlist: string | { id: string }, item: string | { id: string } } | [playlist: string | { id: string }, item: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeItem.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\PlaylistController::removeItem
* @see app/Http/Controllers/PlaylistController.php:407
* @route '/playlists/{playlist}/items/{item}'
*/
const removeItemForm = (args: { playlist: string | { id: string }, item: string | { id: string } } | [playlist: string | { id: string }, item: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: removeItem.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::removeItem
* @see app/Http/Controllers/PlaylistController.php:407
* @route '/playlists/{playlist}/items/{item}'
*/
removeItemForm.delete = (args: { playlist: string | { id: string }, item: string | { id: string } } | [playlist: string | { id: string }, item: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: removeItem.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

removeItem.form = removeItemForm

/**
* @see \App\Http\Controllers\PlaylistController::reorderItems
* @see app/Http/Controllers/PlaylistController.php:313
* @route '/playlists/{playlist}/reorder'
*/
export const reorderItems = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorderItems.url(args, options),
    method: 'post',
})

reorderItems.definition = {
    methods: ["post"],
    url: '/playlists/{playlist}/reorder',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlaylistController::reorderItems
* @see app/Http/Controllers/PlaylistController.php:313
* @route '/playlists/{playlist}/reorder'
*/
reorderItems.url = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return reorderItems.definition.url
            .replace('{playlist}', parsedArgs.playlist.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::reorderItems
* @see app/Http/Controllers/PlaylistController.php:313
* @route '/playlists/{playlist}/reorder'
*/
reorderItems.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorderItems.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::reorderItems
* @see app/Http/Controllers/PlaylistController.php:313
* @route '/playlists/{playlist}/reorder'
*/
const reorderItemsForm = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reorderItems.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::reorderItems
* @see app/Http/Controllers/PlaylistController.php:313
* @route '/playlists/{playlist}/reorder'
*/
reorderItemsForm.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reorderItems.url(args, options),
    method: 'post',
})

reorderItems.form = reorderItemsForm

/**
* @see \App\Http\Controllers\PlaylistController::duplicate
* @see app/Http/Controllers/PlaylistController.php:424
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
* @see app/Http/Controllers/PlaylistController.php:424
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
* @see app/Http/Controllers/PlaylistController.php:424
* @route '/playlists/{playlist}/duplicate'
*/
duplicate.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: duplicate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::duplicate
* @see app/Http/Controllers/PlaylistController.php:424
* @route '/playlists/{playlist}/duplicate'
*/
const duplicateForm = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: duplicate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::duplicate
* @see app/Http/Controllers/PlaylistController.php:424
* @route '/playlists/{playlist}/duplicate'
*/
duplicateForm.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: duplicate.url(args, options),
    method: 'post',
})

duplicate.form = duplicateForm

/**
* @see \App\Http\Controllers\PlaylistController::preview
* @see app/Http/Controllers/PlaylistController.php:462
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
* @see app/Http/Controllers/PlaylistController.php:462
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
* @see app/Http/Controllers/PlaylistController.php:462
* @route '/playlists/{playlist}/preview'
*/
preview.get = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::preview
* @see app/Http/Controllers/PlaylistController.php:462
* @route '/playlists/{playlist}/preview'
*/
preview.head = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: preview.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlaylistController::preview
* @see app/Http/Controllers/PlaylistController.php:462
* @route '/playlists/{playlist}/preview'
*/
const previewForm = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::preview
* @see app/Http/Controllers/PlaylistController.php:462
* @route '/playlists/{playlist}/preview'
*/
previewForm.get = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlaylistController::preview
* @see app/Http/Controllers/PlaylistController.php:462
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
* @see app/Http/Controllers/PlaylistController.php:524
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
* @see app/Http/Controllers/PlaylistController.php:524
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
* @see app/Http/Controllers/PlaylistController.php:524
* @route '/playlists/{playlist}/refresh-players'
*/
refreshPlayers.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshPlayers.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::refreshPlayers
* @see app/Http/Controllers/PlaylistController.php:524
* @route '/playlists/{playlist}/refresh-players'
*/
const refreshPlayersForm = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: refreshPlayers.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::refreshPlayers
* @see app/Http/Controllers/PlaylistController.php:524
* @route '/playlists/{playlist}/refresh-players'
*/
refreshPlayersForm.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: refreshPlayers.url(args, options),
    method: 'post',
})

refreshPlayers.form = refreshPlayersForm

const PlaylistController = { index, create, store, show, update, destroy, search, updateItems, addItem, removeItem, reorderItems, duplicate, preview, refreshPlayers }

export default PlaylistController