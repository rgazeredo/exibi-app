import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PlayerController::index
* @see app/Http/Controllers/PlayerController.php:20
* @route '/players'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/players',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlayerController::index
* @see app/Http/Controllers/PlayerController.php:20
* @route '/players'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::index
* @see app/Http/Controllers/PlayerController.php:20
* @route '/players'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::index
* @see app/Http/Controllers/PlayerController.php:20
* @route '/players'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::index
* @see app/Http/Controllers/PlayerController.php:20
* @route '/players'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::index
* @see app/Http/Controllers/PlayerController.php:20
* @route '/players'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::index
* @see app/Http/Controllers/PlayerController.php:20
* @route '/players'
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
* @see \App\Http\Controllers\PlayerController::create
* @see app/Http/Controllers/PlayerController.php:87
* @route '/players/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/players/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlayerController::create
* @see app/Http/Controllers/PlayerController.php:87
* @route '/players/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::create
* @see app/Http/Controllers/PlayerController.php:87
* @route '/players/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::create
* @see app/Http/Controllers/PlayerController.php:87
* @route '/players/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::create
* @see app/Http/Controllers/PlayerController.php:87
* @route '/players/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::create
* @see app/Http/Controllers/PlayerController.php:87
* @route '/players/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::create
* @see app/Http/Controllers/PlayerController.php:87
* @route '/players/create'
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
* @see \App\Http\Controllers\PlayerController::store
* @see app/Http/Controllers/PlayerController.php:97
* @route '/players'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/players',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlayerController::store
* @see app/Http/Controllers/PlayerController.php:97
* @route '/players'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::store
* @see app/Http/Controllers/PlayerController.php:97
* @route '/players'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::store
* @see app/Http/Controllers/PlayerController.php:97
* @route '/players'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::store
* @see app/Http/Controllers/PlayerController.php:97
* @route '/players'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\PlayerController::show
* @see app/Http/Controllers/PlayerController.php:183
* @route '/players/{player}'
*/
export const show = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/players/{player}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlayerController::show
* @see app/Http/Controllers/PlayerController.php:183
* @route '/players/{player}'
*/
show.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { player: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { player: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            player: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        player: typeof args.player === 'object'
        ? args.player.id
        : args.player,
    }

    return show.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::show
* @see app/Http/Controllers/PlayerController.php:183
* @route '/players/{player}'
*/
show.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::show
* @see app/Http/Controllers/PlayerController.php:183
* @route '/players/{player}'
*/
show.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::show
* @see app/Http/Controllers/PlayerController.php:183
* @route '/players/{player}'
*/
const showForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::show
* @see app/Http/Controllers/PlayerController.php:183
* @route '/players/{player}'
*/
showForm.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::show
* @see app/Http/Controllers/PlayerController.php:183
* @route '/players/{player}'
*/
showForm.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\PlayerController::edit
* @see app/Http/Controllers/PlayerController.php:250
* @route '/players/{player}/edit'
*/
export const edit = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/players/{player}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlayerController::edit
* @see app/Http/Controllers/PlayerController.php:250
* @route '/players/{player}/edit'
*/
edit.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { player: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { player: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            player: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        player: typeof args.player === 'object'
        ? args.player.id
        : args.player,
    }

    return edit.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::edit
* @see app/Http/Controllers/PlayerController.php:250
* @route '/players/{player}/edit'
*/
edit.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::edit
* @see app/Http/Controllers/PlayerController.php:250
* @route '/players/{player}/edit'
*/
edit.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::edit
* @see app/Http/Controllers/PlayerController.php:250
* @route '/players/{player}/edit'
*/
const editForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::edit
* @see app/Http/Controllers/PlayerController.php:250
* @route '/players/{player}/edit'
*/
editForm.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::edit
* @see app/Http/Controllers/PlayerController.php:250
* @route '/players/{player}/edit'
*/
editForm.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\PlayerController::update
* @see app/Http/Controllers/PlayerController.php:277
* @route '/players/{player}'
*/
export const update = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/players/{player}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\PlayerController::update
* @see app/Http/Controllers/PlayerController.php:277
* @route '/players/{player}'
*/
update.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { player: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { player: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            player: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        player: typeof args.player === 'object'
        ? args.player.id
        : args.player,
    }

    return update.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::update
* @see app/Http/Controllers/PlayerController.php:277
* @route '/players/{player}'
*/
update.put = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\PlayerController::update
* @see app/Http/Controllers/PlayerController.php:277
* @route '/players/{player}'
*/
update.patch = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\PlayerController::update
* @see app/Http/Controllers/PlayerController.php:277
* @route '/players/{player}'
*/
const updateForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::update
* @see app/Http/Controllers/PlayerController.php:277
* @route '/players/{player}'
*/
updateForm.put = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::update
* @see app/Http/Controllers/PlayerController.php:277
* @route '/players/{player}'
*/
updateForm.patch = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\PlayerController::destroy
* @see app/Http/Controllers/PlayerController.php:321
* @route '/players/{player}'
*/
export const destroy = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/players/{player}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PlayerController::destroy
* @see app/Http/Controllers/PlayerController.php:321
* @route '/players/{player}'
*/
destroy.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { player: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { player: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            player: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        player: typeof args.player === 'object'
        ? args.player.id
        : args.player,
    }

    return destroy.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::destroy
* @see app/Http/Controllers/PlayerController.php:321
* @route '/players/{player}'
*/
destroy.delete = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\PlayerController::destroy
* @see app/Http/Controllers/PlayerController.php:321
* @route '/players/{player}'
*/
const destroyForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::destroy
* @see app/Http/Controllers/PlayerController.php:321
* @route '/players/{player}'
*/
destroyForm.delete = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\PlayerController::search
* @see app/Http/Controllers/PlayerController.php:28
* @route '/api/players/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/api/players/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlayerController::search
* @see app/Http/Controllers/PlayerController.php:28
* @route '/api/players/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::search
* @see app/Http/Controllers/PlayerController.php:28
* @route '/api/players/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::search
* @see app/Http/Controllers/PlayerController.php:28
* @route '/api/players/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::search
* @see app/Http/Controllers/PlayerController.php:28
* @route '/api/players/search'
*/
const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::search
* @see app/Http/Controllers/PlayerController.php:28
* @route '/api/players/search'
*/
searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::search
* @see app/Http/Controllers/PlayerController.php:28
* @route '/api/players/search'
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
* @see \App\Http\Controllers\PlayerController::regenerateToken
* @see app/Http/Controllers/PlayerController.php:401
* @route '/players/{player}/regenerate-token'
*/
export const regenerateToken = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateToken.url(args, options),
    method: 'post',
})

regenerateToken.definition = {
    methods: ["post"],
    url: '/players/{player}/regenerate-token',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlayerController::regenerateToken
* @see app/Http/Controllers/PlayerController.php:401
* @route '/players/{player}/regenerate-token'
*/
regenerateToken.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { player: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { player: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            player: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        player: typeof args.player === 'object'
        ? args.player.id
        : args.player,
    }

    return regenerateToken.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::regenerateToken
* @see app/Http/Controllers/PlayerController.php:401
* @route '/players/{player}/regenerate-token'
*/
regenerateToken.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateToken.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::regenerateToken
* @see app/Http/Controllers/PlayerController.php:401
* @route '/players/{player}/regenerate-token'
*/
const regenerateTokenForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerateToken.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::regenerateToken
* @see app/Http/Controllers/PlayerController.php:401
* @route '/players/{player}/regenerate-token'
*/
regenerateTokenForm.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerateToken.url(args, options),
    method: 'post',
})

regenerateToken.form = regenerateTokenForm

/**
* @see \App\Http\Controllers\PlayerController::refreshPlaylist
* @see app/Http/Controllers/PlayerController.php:413
* @route '/players/{player}/refresh-playlist'
*/
export const refreshPlaylist = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshPlaylist.url(args, options),
    method: 'post',
})

refreshPlaylist.definition = {
    methods: ["post"],
    url: '/players/{player}/refresh-playlist',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlayerController::refreshPlaylist
* @see app/Http/Controllers/PlayerController.php:413
* @route '/players/{player}/refresh-playlist'
*/
refreshPlaylist.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { player: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { player: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            player: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        player: typeof args.player === 'object'
        ? args.player.id
        : args.player,
    }

    return refreshPlaylist.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::refreshPlaylist
* @see app/Http/Controllers/PlayerController.php:413
* @route '/players/{player}/refresh-playlist'
*/
refreshPlaylist.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshPlaylist.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::refreshPlaylist
* @see app/Http/Controllers/PlayerController.php:413
* @route '/players/{player}/refresh-playlist'
*/
const refreshPlaylistForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: refreshPlaylist.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::refreshPlaylist
* @see app/Http/Controllers/PlayerController.php:413
* @route '/players/{player}/refresh-playlist'
*/
refreshPlaylistForm.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: refreshPlaylist.url(args, options),
    method: 'post',
})

refreshPlaylist.form = refreshPlaylistForm

/**
* @see \App\Http\Controllers\PlayerController::refreshApp
* @see app/Http/Controllers/PlayerController.php:433
* @route '/players/{player}/refresh-app'
*/
export const refreshApp = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshApp.url(args, options),
    method: 'post',
})

refreshApp.definition = {
    methods: ["post"],
    url: '/players/{player}/refresh-app',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlayerController::refreshApp
* @see app/Http/Controllers/PlayerController.php:433
* @route '/players/{player}/refresh-app'
*/
refreshApp.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { player: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { player: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            player: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        player: typeof args.player === 'object'
        ? args.player.id
        : args.player,
    }

    return refreshApp.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::refreshApp
* @see app/Http/Controllers/PlayerController.php:433
* @route '/players/{player}/refresh-app'
*/
refreshApp.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshApp.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::refreshApp
* @see app/Http/Controllers/PlayerController.php:433
* @route '/players/{player}/refresh-app'
*/
const refreshAppForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: refreshApp.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::refreshApp
* @see app/Http/Controllers/PlayerController.php:433
* @route '/players/{player}/refresh-app'
*/
refreshAppForm.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: refreshApp.url(args, options),
    method: 'post',
})

refreshApp.form = refreshAppForm

/**
* @see \App\Http\Controllers\PlayerController::reboot
* @see app/Http/Controllers/PlayerController.php:450
* @route '/players/{player}/reboot'
*/
export const reboot = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reboot.url(args, options),
    method: 'post',
})

reboot.definition = {
    methods: ["post"],
    url: '/players/{player}/reboot',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlayerController::reboot
* @see app/Http/Controllers/PlayerController.php:450
* @route '/players/{player}/reboot'
*/
reboot.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { player: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { player: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            player: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        player: typeof args.player === 'object'
        ? args.player.id
        : args.player,
    }

    return reboot.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::reboot
* @see app/Http/Controllers/PlayerController.php:450
* @route '/players/{player}/reboot'
*/
reboot.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reboot.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::reboot
* @see app/Http/Controllers/PlayerController.php:450
* @route '/players/{player}/reboot'
*/
const rebootForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reboot.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::reboot
* @see app/Http/Controllers/PlayerController.php:450
* @route '/players/{player}/reboot'
*/
rebootForm.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reboot.url(args, options),
    method: 'post',
})

reboot.form = rebootForm

/**
* @see \App\Http\Controllers\PlayerController::screenshot
* @see app/Http/Controllers/PlayerController.php:467
* @route '/players/{player}/screenshot'
*/
export const screenshot = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: screenshot.url(args, options),
    method: 'post',
})

screenshot.definition = {
    methods: ["post"],
    url: '/players/{player}/screenshot',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlayerController::screenshot
* @see app/Http/Controllers/PlayerController.php:467
* @route '/players/{player}/screenshot'
*/
screenshot.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { player: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { player: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            player: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        player: typeof args.player === 'object'
        ? args.player.id
        : args.player,
    }

    return screenshot.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::screenshot
* @see app/Http/Controllers/PlayerController.php:467
* @route '/players/{player}/screenshot'
*/
screenshot.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: screenshot.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::screenshot
* @see app/Http/Controllers/PlayerController.php:467
* @route '/players/{player}/screenshot'
*/
const screenshotForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: screenshot.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::screenshot
* @see app/Http/Controllers/PlayerController.php:467
* @route '/players/{player}/screenshot'
*/
screenshotForm.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: screenshot.url(args, options),
    method: 'post',
})

screenshot.form = screenshotForm

/**
* @see \App\Http\Controllers\PlayerController::screenshotStatus
* @see app/Http/Controllers/PlayerController.php:836
* @route '/players/{player}/screenshot-status'
*/
export const screenshotStatus = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: screenshotStatus.url(args, options),
    method: 'get',
})

screenshotStatus.definition = {
    methods: ["get","head"],
    url: '/players/{player}/screenshot-status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlayerController::screenshotStatus
* @see app/Http/Controllers/PlayerController.php:836
* @route '/players/{player}/screenshot-status'
*/
screenshotStatus.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { player: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { player: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            player: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        player: typeof args.player === 'object'
        ? args.player.id
        : args.player,
    }

    return screenshotStatus.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::screenshotStatus
* @see app/Http/Controllers/PlayerController.php:836
* @route '/players/{player}/screenshot-status'
*/
screenshotStatus.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: screenshotStatus.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::screenshotStatus
* @see app/Http/Controllers/PlayerController.php:836
* @route '/players/{player}/screenshot-status'
*/
screenshotStatus.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: screenshotStatus.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::screenshotStatus
* @see app/Http/Controllers/PlayerController.php:836
* @route '/players/{player}/screenshot-status'
*/
const screenshotStatusForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: screenshotStatus.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::screenshotStatus
* @see app/Http/Controllers/PlayerController.php:836
* @route '/players/{player}/screenshot-status'
*/
screenshotStatusForm.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: screenshotStatus.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::screenshotStatus
* @see app/Http/Controllers/PlayerController.php:836
* @route '/players/{player}/screenshot-status'
*/
screenshotStatusForm.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: screenshotStatus.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

screenshotStatus.form = screenshotStatusForm

/**
* @see \App\Http\Controllers\PlayerController::currentlyPlaying
* @see app/Http/Controllers/PlayerController.php:917
* @route '/players/{player}/currently-playing'
*/
export const currentlyPlaying = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: currentlyPlaying.url(args, options),
    method: 'get',
})

currentlyPlaying.definition = {
    methods: ["get","head"],
    url: '/players/{player}/currently-playing',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlayerController::currentlyPlaying
* @see app/Http/Controllers/PlayerController.php:917
* @route '/players/{player}/currently-playing'
*/
currentlyPlaying.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { player: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { player: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            player: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        player: typeof args.player === 'object'
        ? args.player.id
        : args.player,
    }

    return currentlyPlaying.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::currentlyPlaying
* @see app/Http/Controllers/PlayerController.php:917
* @route '/players/{player}/currently-playing'
*/
currentlyPlaying.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: currentlyPlaying.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::currentlyPlaying
* @see app/Http/Controllers/PlayerController.php:917
* @route '/players/{player}/currently-playing'
*/
currentlyPlaying.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: currentlyPlaying.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::currentlyPlaying
* @see app/Http/Controllers/PlayerController.php:917
* @route '/players/{player}/currently-playing'
*/
const currentlyPlayingForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: currentlyPlaying.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::currentlyPlaying
* @see app/Http/Controllers/PlayerController.php:917
* @route '/players/{player}/currently-playing'
*/
currentlyPlayingForm.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: currentlyPlaying.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::currentlyPlaying
* @see app/Http/Controllers/PlayerController.php:917
* @route '/players/{player}/currently-playing'
*/
currentlyPlayingForm.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: currentlyPlaying.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

currentlyPlaying.form = currentlyPlayingForm

/**
* @see \App\Http\Controllers\PlayerController::downloads
* @see app/Http/Controllers/PlayerController.php:492
* @route '/players/{player}/downloads'
*/
export const downloads = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: downloads.url(args, options),
    method: 'get',
})

downloads.definition = {
    methods: ["get","head"],
    url: '/players/{player}/downloads',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlayerController::downloads
* @see app/Http/Controllers/PlayerController.php:492
* @route '/players/{player}/downloads'
*/
downloads.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { player: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { player: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            player: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        player: typeof args.player === 'object'
        ? args.player.id
        : args.player,
    }

    return downloads.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::downloads
* @see app/Http/Controllers/PlayerController.php:492
* @route '/players/{player}/downloads'
*/
downloads.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: downloads.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::downloads
* @see app/Http/Controllers/PlayerController.php:492
* @route '/players/{player}/downloads'
*/
downloads.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: downloads.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::downloads
* @see app/Http/Controllers/PlayerController.php:492
* @route '/players/{player}/downloads'
*/
const downloadsForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: downloads.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::downloads
* @see app/Http/Controllers/PlayerController.php:492
* @route '/players/{player}/downloads'
*/
downloadsForm.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: downloads.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::downloads
* @see app/Http/Controllers/PlayerController.php:492
* @route '/players/{player}/downloads'
*/
downloadsForm.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: downloads.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

downloads.form = downloadsForm

/**
* @see \App\Http\Controllers\PlayerController::playbackLogs
* @see app/Http/Controllers/PlayerController.php:893
* @route '/players/{player}/playback-logs'
*/
export const playbackLogs = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: playbackLogs.url(args, options),
    method: 'get',
})

playbackLogs.definition = {
    methods: ["get","head"],
    url: '/players/{player}/playback-logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlayerController::playbackLogs
* @see app/Http/Controllers/PlayerController.php:893
* @route '/players/{player}/playback-logs'
*/
playbackLogs.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { player: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { player: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            player: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        player: typeof args.player === 'object'
        ? args.player.id
        : args.player,
    }

    return playbackLogs.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::playbackLogs
* @see app/Http/Controllers/PlayerController.php:893
* @route '/players/{player}/playback-logs'
*/
playbackLogs.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: playbackLogs.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::playbackLogs
* @see app/Http/Controllers/PlayerController.php:893
* @route '/players/{player}/playback-logs'
*/
playbackLogs.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: playbackLogs.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::playbackLogs
* @see app/Http/Controllers/PlayerController.php:893
* @route '/players/{player}/playback-logs'
*/
const playbackLogsForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: playbackLogs.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::playbackLogs
* @see app/Http/Controllers/PlayerController.php:893
* @route '/players/{player}/playback-logs'
*/
playbackLogsForm.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: playbackLogs.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::playbackLogs
* @see app/Http/Controllers/PlayerController.php:893
* @route '/players/{player}/playback-logs'
*/
playbackLogsForm.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: playbackLogs.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

playbackLogs.form = playbackLogsForm

/**
* @see \App\Http\Controllers\PlayerController::replace
* @see app/Http/Controllers/PlayerController.php:338
* @route '/players/{player}/replace'
*/
export const replace = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: replace.url(args, options),
    method: 'post',
})

replace.definition = {
    methods: ["post"],
    url: '/players/{player}/replace',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlayerController::replace
* @see app/Http/Controllers/PlayerController.php:338
* @route '/players/{player}/replace'
*/
replace.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { player: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { player: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            player: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        player: typeof args.player === 'object'
        ? args.player.id
        : args.player,
    }

    return replace.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::replace
* @see app/Http/Controllers/PlayerController.php:338
* @route '/players/{player}/replace'
*/
replace.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: replace.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::replace
* @see app/Http/Controllers/PlayerController.php:338
* @route '/players/{player}/replace'
*/
const replaceForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: replace.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::replace
* @see app/Http/Controllers/PlayerController.php:338
* @route '/players/{player}/replace'
*/
replaceForm.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: replace.url(args, options),
    method: 'post',
})

replace.form = replaceForm

const players = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    search: Object.assign(search, search),
    regenerateToken: Object.assign(regenerateToken, regenerateToken),
    refreshPlaylist: Object.assign(refreshPlaylist, refreshPlaylist),
    refreshApp: Object.assign(refreshApp, refreshApp),
    reboot: Object.assign(reboot, reboot),
    screenshot: Object.assign(screenshot, screenshot),
    screenshotStatus: Object.assign(screenshotStatus, screenshotStatus),
    currentlyPlaying: Object.assign(currentlyPlaying, currentlyPlaying),
    downloads: Object.assign(downloads, downloads),
    playbackLogs: Object.assign(playbackLogs, playbackLogs),
    replace: Object.assign(replace, replace),
}

export default players