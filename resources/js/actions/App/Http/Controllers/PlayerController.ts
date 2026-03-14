import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
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
* @see app/Http/Controllers/PlayerController.php:88
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
* @see app/Http/Controllers/PlayerController.php:88
* @route '/players/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::create
* @see app/Http/Controllers/PlayerController.php:88
* @route '/players/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::create
* @see app/Http/Controllers/PlayerController.php:88
* @route '/players/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::create
* @see app/Http/Controllers/PlayerController.php:88
* @route '/players/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::create
* @see app/Http/Controllers/PlayerController.php:88
* @route '/players/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::create
* @see app/Http/Controllers/PlayerController.php:88
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
* @see app/Http/Controllers/PlayerController.php:98
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
* @see app/Http/Controllers/PlayerController.php:98
* @route '/players'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::store
* @see app/Http/Controllers/PlayerController.php:98
* @route '/players'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::store
* @see app/Http/Controllers/PlayerController.php:98
* @route '/players'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::store
* @see app/Http/Controllers/PlayerController.php:98
* @route '/players'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\PlayerController::show
* @see app/Http/Controllers/PlayerController.php:184
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
* @see app/Http/Controllers/PlayerController.php:184
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
* @see app/Http/Controllers/PlayerController.php:184
* @route '/players/{player}'
*/
show.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::show
* @see app/Http/Controllers/PlayerController.php:184
* @route '/players/{player}'
*/
show.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::show
* @see app/Http/Controllers/PlayerController.php:184
* @route '/players/{player}'
*/
const showForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::show
* @see app/Http/Controllers/PlayerController.php:184
* @route '/players/{player}'
*/
showForm.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::show
* @see app/Http/Controllers/PlayerController.php:184
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
* @see app/Http/Controllers/PlayerController.php:253
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
* @see app/Http/Controllers/PlayerController.php:253
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
* @see app/Http/Controllers/PlayerController.php:253
* @route '/players/{player}/edit'
*/
edit.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::edit
* @see app/Http/Controllers/PlayerController.php:253
* @route '/players/{player}/edit'
*/
edit.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::edit
* @see app/Http/Controllers/PlayerController.php:253
* @route '/players/{player}/edit'
*/
const editForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::edit
* @see app/Http/Controllers/PlayerController.php:253
* @route '/players/{player}/edit'
*/
editForm.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::edit
* @see app/Http/Controllers/PlayerController.php:253
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
* @see app/Http/Controllers/PlayerController.php:280
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
* @see app/Http/Controllers/PlayerController.php:280
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
* @see app/Http/Controllers/PlayerController.php:280
* @route '/players/{player}'
*/
update.put = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\PlayerController::update
* @see app/Http/Controllers/PlayerController.php:280
* @route '/players/{player}'
*/
update.patch = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\PlayerController::update
* @see app/Http/Controllers/PlayerController.php:280
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
* @see app/Http/Controllers/PlayerController.php:280
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
* @see app/Http/Controllers/PlayerController.php:280
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
* @see app/Http/Controllers/PlayerController.php:324
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
* @see app/Http/Controllers/PlayerController.php:324
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
* @see app/Http/Controllers/PlayerController.php:324
* @route '/players/{player}'
*/
destroy.delete = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\PlayerController::destroy
* @see app/Http/Controllers/PlayerController.php:324
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
* @see app/Http/Controllers/PlayerController.php:324
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
* @see app/Http/Controllers/PlayerController.php:404
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
* @see app/Http/Controllers/PlayerController.php:404
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
* @see app/Http/Controllers/PlayerController.php:404
* @route '/players/{player}/regenerate-token'
*/
regenerateToken.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateToken.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::regenerateToken
* @see app/Http/Controllers/PlayerController.php:404
* @route '/players/{player}/regenerate-token'
*/
const regenerateTokenForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerateToken.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::regenerateToken
* @see app/Http/Controllers/PlayerController.php:404
* @route '/players/{player}/regenerate-token'
*/
regenerateTokenForm.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerateToken.url(args, options),
    method: 'post',
})

regenerateToken.form = regenerateTokenForm

/**
* @see \App\Http\Controllers\PlayerController::refreshPlayer
* @see app/Http/Controllers/PlayerController.php:416
* @route '/players/{player}/refresh-playlist'
*/
export const refreshPlayer = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshPlayer.url(args, options),
    method: 'post',
})

refreshPlayer.definition = {
    methods: ["post"],
    url: '/players/{player}/refresh-playlist',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlayerController::refreshPlayer
* @see app/Http/Controllers/PlayerController.php:416
* @route '/players/{player}/refresh-playlist'
*/
refreshPlayer.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return refreshPlayer.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::refreshPlayer
* @see app/Http/Controllers/PlayerController.php:416
* @route '/players/{player}/refresh-playlist'
*/
refreshPlayer.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshPlayer.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::refreshPlayer
* @see app/Http/Controllers/PlayerController.php:416
* @route '/players/{player}/refresh-playlist'
*/
const refreshPlayerForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: refreshPlayer.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::refreshPlayer
* @see app/Http/Controllers/PlayerController.php:416
* @route '/players/{player}/refresh-playlist'
*/
refreshPlayerForm.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: refreshPlayer.url(args, options),
    method: 'post',
})

refreshPlayer.form = refreshPlayerForm

/**
* @see \App\Http\Controllers\PlayerController::refreshApp
* @see app/Http/Controllers/PlayerController.php:436
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
* @see app/Http/Controllers/PlayerController.php:436
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
* @see app/Http/Controllers/PlayerController.php:436
* @route '/players/{player}/refresh-app'
*/
refreshApp.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshApp.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::refreshApp
* @see app/Http/Controllers/PlayerController.php:436
* @route '/players/{player}/refresh-app'
*/
const refreshAppForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: refreshApp.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::refreshApp
* @see app/Http/Controllers/PlayerController.php:436
* @route '/players/{player}/refresh-app'
*/
refreshAppForm.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: refreshApp.url(args, options),
    method: 'post',
})

refreshApp.form = refreshAppForm

/**
* @see \App\Http\Controllers\PlayerController::reboot
* @see app/Http/Controllers/PlayerController.php:453
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
* @see app/Http/Controllers/PlayerController.php:453
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
* @see app/Http/Controllers/PlayerController.php:453
* @route '/players/{player}/reboot'
*/
reboot.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reboot.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::reboot
* @see app/Http/Controllers/PlayerController.php:453
* @route '/players/{player}/reboot'
*/
const rebootForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reboot.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::reboot
* @see app/Http/Controllers/PlayerController.php:453
* @route '/players/{player}/reboot'
*/
rebootForm.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reboot.url(args, options),
    method: 'post',
})

reboot.form = rebootForm

/**
* @see \App\Http\Controllers\PlayerController::requestScreenshot
* @see app/Http/Controllers/PlayerController.php:470
* @route '/players/{player}/screenshot'
*/
export const requestScreenshot = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestScreenshot.url(args, options),
    method: 'post',
})

requestScreenshot.definition = {
    methods: ["post"],
    url: '/players/{player}/screenshot',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlayerController::requestScreenshot
* @see app/Http/Controllers/PlayerController.php:470
* @route '/players/{player}/screenshot'
*/
requestScreenshot.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return requestScreenshot.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::requestScreenshot
* @see app/Http/Controllers/PlayerController.php:470
* @route '/players/{player}/screenshot'
*/
requestScreenshot.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestScreenshot.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::requestScreenshot
* @see app/Http/Controllers/PlayerController.php:470
* @route '/players/{player}/screenshot'
*/
const requestScreenshotForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: requestScreenshot.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::requestScreenshot
* @see app/Http/Controllers/PlayerController.php:470
* @route '/players/{player}/screenshot'
*/
requestScreenshotForm.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: requestScreenshot.url(args, options),
    method: 'post',
})

requestScreenshot.form = requestScreenshotForm

/**
* @see \App\Http\Controllers\PlayerController::screenshotStatus
* @see app/Http/Controllers/PlayerController.php:839
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
* @see app/Http/Controllers/PlayerController.php:839
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
* @see app/Http/Controllers/PlayerController.php:839
* @route '/players/{player}/screenshot-status'
*/
screenshotStatus.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: screenshotStatus.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::screenshotStatus
* @see app/Http/Controllers/PlayerController.php:839
* @route '/players/{player}/screenshot-status'
*/
screenshotStatus.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: screenshotStatus.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::screenshotStatus
* @see app/Http/Controllers/PlayerController.php:839
* @route '/players/{player}/screenshot-status'
*/
const screenshotStatusForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: screenshotStatus.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::screenshotStatus
* @see app/Http/Controllers/PlayerController.php:839
* @route '/players/{player}/screenshot-status'
*/
screenshotStatusForm.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: screenshotStatus.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::screenshotStatus
* @see app/Http/Controllers/PlayerController.php:839
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
* @see app/Http/Controllers/PlayerController.php:920
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
* @see app/Http/Controllers/PlayerController.php:920
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
* @see app/Http/Controllers/PlayerController.php:920
* @route '/players/{player}/currently-playing'
*/
currentlyPlaying.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: currentlyPlaying.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::currentlyPlaying
* @see app/Http/Controllers/PlayerController.php:920
* @route '/players/{player}/currently-playing'
*/
currentlyPlaying.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: currentlyPlaying.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::currentlyPlaying
* @see app/Http/Controllers/PlayerController.php:920
* @route '/players/{player}/currently-playing'
*/
const currentlyPlayingForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: currentlyPlaying.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::currentlyPlaying
* @see app/Http/Controllers/PlayerController.php:920
* @route '/players/{player}/currently-playing'
*/
currentlyPlayingForm.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: currentlyPlaying.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::currentlyPlaying
* @see app/Http/Controllers/PlayerController.php:920
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
* @see app/Http/Controllers/PlayerController.php:495
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
* @see app/Http/Controllers/PlayerController.php:495
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
* @see app/Http/Controllers/PlayerController.php:495
* @route '/players/{player}/downloads'
*/
downloads.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: downloads.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::downloads
* @see app/Http/Controllers/PlayerController.php:495
* @route '/players/{player}/downloads'
*/
downloads.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: downloads.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::downloads
* @see app/Http/Controllers/PlayerController.php:495
* @route '/players/{player}/downloads'
*/
const downloadsForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: downloads.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::downloads
* @see app/Http/Controllers/PlayerController.php:495
* @route '/players/{player}/downloads'
*/
downloadsForm.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: downloads.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::downloads
* @see app/Http/Controllers/PlayerController.php:495
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
* @see app/Http/Controllers/PlayerController.php:896
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
* @see app/Http/Controllers/PlayerController.php:896
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
* @see app/Http/Controllers/PlayerController.php:896
* @route '/players/{player}/playback-logs'
*/
playbackLogs.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: playbackLogs.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::playbackLogs
* @see app/Http/Controllers/PlayerController.php:896
* @route '/players/{player}/playback-logs'
*/
playbackLogs.head = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: playbackLogs.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PlayerController::playbackLogs
* @see app/Http/Controllers/PlayerController.php:896
* @route '/players/{player}/playback-logs'
*/
const playbackLogsForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: playbackLogs.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::playbackLogs
* @see app/Http/Controllers/PlayerController.php:896
* @route '/players/{player}/playback-logs'
*/
playbackLogsForm.get = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: playbackLogs.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PlayerController::playbackLogs
* @see app/Http/Controllers/PlayerController.php:896
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
* @see \App\Http\Controllers\PlayerController::replacePlayer
* @see app/Http/Controllers/PlayerController.php:341
* @route '/players/{player}/replace'
*/
export const replacePlayer = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: replacePlayer.url(args, options),
    method: 'post',
})

replacePlayer.definition = {
    methods: ["post"],
    url: '/players/{player}/replace',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlayerController::replacePlayer
* @see app/Http/Controllers/PlayerController.php:341
* @route '/players/{player}/replace'
*/
replacePlayer.url = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return replacePlayer.definition.url
            .replace('{player}', parsedArgs.player.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlayerController::replacePlayer
* @see app/Http/Controllers/PlayerController.php:341
* @route '/players/{player}/replace'
*/
replacePlayer.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: replacePlayer.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::replacePlayer
* @see app/Http/Controllers/PlayerController.php:341
* @route '/players/{player}/replace'
*/
const replacePlayerForm = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: replacePlayer.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlayerController::replacePlayer
* @see app/Http/Controllers/PlayerController.php:341
* @route '/players/{player}/replace'
*/
replacePlayerForm.post = (args: { player: string | { id: string } } | [player: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: replacePlayer.url(args, options),
    method: 'post',
})

replacePlayer.form = replacePlayerForm

const PlayerController = { index, create, store, show, edit, update, destroy, search, regenerateToken, refreshPlayer, refreshApp, reboot, requestScreenshot, screenshotStatus, currentlyPlaying, downloads, playbackLogs, replacePlayer }

export default PlayerController