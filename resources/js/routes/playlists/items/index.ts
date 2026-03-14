import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PlaylistController::update
* @see app/Http/Controllers/PlaylistController.php:213
* @route '/playlists/{playlist}/items'
*/
export const update = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/playlists/{playlist}/items',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PlaylistController::update
* @see app/Http/Controllers/PlaylistController.php:213
* @route '/playlists/{playlist}/items'
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
* @see app/Http/Controllers/PlaylistController.php:213
* @route '/playlists/{playlist}/items'
*/
update.put = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\PlaylistController::update
* @see app/Http/Controllers/PlaylistController.php:213
* @route '/playlists/{playlist}/items'
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
* @see app/Http/Controllers/PlaylistController.php:213
* @route '/playlists/{playlist}/items'
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

update.form = updateForm

/**
* @see \App\Http\Controllers\PlaylistController::add
* @see app/Http/Controllers/PlaylistController.php:352
* @route '/playlists/{playlist}/items'
*/
export const add = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(args, options),
    method: 'post',
})

add.definition = {
    methods: ["post"],
    url: '/playlists/{playlist}/items',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlaylistController::add
* @see app/Http/Controllers/PlaylistController.php:352
* @route '/playlists/{playlist}/items'
*/
add.url = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return add.definition.url
            .replace('{playlist}', parsedArgs.playlist.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::add
* @see app/Http/Controllers/PlaylistController.php:352
* @route '/playlists/{playlist}/items'
*/
add.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::add
* @see app/Http/Controllers/PlaylistController.php:352
* @route '/playlists/{playlist}/items'
*/
const addForm = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: add.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::add
* @see app/Http/Controllers/PlaylistController.php:352
* @route '/playlists/{playlist}/items'
*/
addForm.post = (args: { playlist: string | { id: string } } | [playlist: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: add.url(args, options),
    method: 'post',
})

add.form = addForm

/**
* @see \App\Http\Controllers\PlaylistController::remove
* @see app/Http/Controllers/PlaylistController.php:416
* @route '/playlists/{playlist}/items/{item}'
*/
export const remove = (args: { playlist: string | { id: string }, item: string | { id: string } } | [playlist: string | { id: string }, item: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: remove.url(args, options),
    method: 'delete',
})

remove.definition = {
    methods: ["delete"],
    url: '/playlists/{playlist}/items/{item}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PlaylistController::remove
* @see app/Http/Controllers/PlaylistController.php:416
* @route '/playlists/{playlist}/items/{item}'
*/
remove.url = (args: { playlist: string | { id: string }, item: string | { id: string } } | [playlist: string | { id: string }, item: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return remove.definition.url
            .replace('{playlist}', parsedArgs.playlist.toString())
            .replace('{item}', parsedArgs.item.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaylistController::remove
* @see app/Http/Controllers/PlaylistController.php:416
* @route '/playlists/{playlist}/items/{item}'
*/
remove.delete = (args: { playlist: string | { id: string }, item: string | { id: string } } | [playlist: string | { id: string }, item: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: remove.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\PlaylistController::remove
* @see app/Http/Controllers/PlaylistController.php:416
* @route '/playlists/{playlist}/items/{item}'
*/
const removeForm = (args: { playlist: string | { id: string }, item: string | { id: string } } | [playlist: string | { id: string }, item: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: remove.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaylistController::remove
* @see app/Http/Controllers/PlaylistController.php:416
* @route '/playlists/{playlist}/items/{item}'
*/
removeForm.delete = (args: { playlist: string | { id: string }, item: string | { id: string } } | [playlist: string | { id: string }, item: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: remove.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

remove.form = removeForm

const items = {
    update: Object.assign(update, update),
    add: Object.assign(add, add),
    remove: Object.assign(remove, remove),
}

export default items