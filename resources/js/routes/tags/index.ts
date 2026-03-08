import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\TagController::index
* @see app/Http/Controllers/TagController.php:14
* @route '/tags'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/tags',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TagController::index
* @see app/Http/Controllers/TagController.php:14
* @route '/tags'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TagController::index
* @see app/Http/Controllers/TagController.php:14
* @route '/tags'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TagController::index
* @see app/Http/Controllers/TagController.php:14
* @route '/tags'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TagController::index
* @see app/Http/Controllers/TagController.php:14
* @route '/tags'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TagController::index
* @see app/Http/Controllers/TagController.php:14
* @route '/tags'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TagController::index
* @see app/Http/Controllers/TagController.php:14
* @route '/tags'
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
* @see \App\Http\Controllers\TagController::store
* @see app/Http/Controllers/TagController.php:75
* @route '/tags'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/tags',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TagController::store
* @see app/Http/Controllers/TagController.php:75
* @route '/tags'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TagController::store
* @see app/Http/Controllers/TagController.php:75
* @route '/tags'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TagController::store
* @see app/Http/Controllers/TagController.php:75
* @route '/tags'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TagController::store
* @see app/Http/Controllers/TagController.php:75
* @route '/tags'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\TagController::update
* @see app/Http/Controllers/TagController.php:99
* @route '/tags/{tag}'
*/
export const update = (args: { tag: string | { id: string } } | [tag: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/tags/{tag}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\TagController::update
* @see app/Http/Controllers/TagController.php:99
* @route '/tags/{tag}'
*/
update.url = (args: { tag: string | { id: string } } | [tag: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { tag: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { tag: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            tag: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        tag: typeof args.tag === 'object'
        ? args.tag.id
        : args.tag,
    }

    return update.definition.url
            .replace('{tag}', parsedArgs.tag.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TagController::update
* @see app/Http/Controllers/TagController.php:99
* @route '/tags/{tag}'
*/
update.put = (args: { tag: string | { id: string } } | [tag: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\TagController::update
* @see app/Http/Controllers/TagController.php:99
* @route '/tags/{tag}'
*/
const updateForm = (args: { tag: string | { id: string } } | [tag: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TagController::update
* @see app/Http/Controllers/TagController.php:99
* @route '/tags/{tag}'
*/
updateForm.put = (args: { tag: string | { id: string } } | [tag: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\TagController::destroy
* @see app/Http/Controllers/TagController.php:126
* @route '/tags/{tag}'
*/
export const destroy = (args: { tag: string | { id: string } } | [tag: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/tags/{tag}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TagController::destroy
* @see app/Http/Controllers/TagController.php:126
* @route '/tags/{tag}'
*/
destroy.url = (args: { tag: string | { id: string } } | [tag: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { tag: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { tag: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            tag: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        tag: typeof args.tag === 'object'
        ? args.tag.id
        : args.tag,
    }

    return destroy.definition.url
            .replace('{tag}', parsedArgs.tag.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TagController::destroy
* @see app/Http/Controllers/TagController.php:126
* @route '/tags/{tag}'
*/
destroy.delete = (args: { tag: string | { id: string } } | [tag: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\TagController::destroy
* @see app/Http/Controllers/TagController.php:126
* @route '/tags/{tag}'
*/
const destroyForm = (args: { tag: string | { id: string } } | [tag: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TagController::destroy
* @see app/Http/Controllers/TagController.php:126
* @route '/tags/{tag}'
*/
destroyForm.delete = (args: { tag: string | { id: string } } | [tag: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\TagController::search
* @see app/Http/Controllers/TagController.php:21
* @route '/api/tags/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/api/tags/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TagController::search
* @see app/Http/Controllers/TagController.php:21
* @route '/api/tags/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TagController::search
* @see app/Http/Controllers/TagController.php:21
* @route '/api/tags/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TagController::search
* @see app/Http/Controllers/TagController.php:21
* @route '/api/tags/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TagController::search
* @see app/Http/Controllers/TagController.php:21
* @route '/api/tags/search'
*/
const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TagController::search
* @see app/Http/Controllers/TagController.php:21
* @route '/api/tags/search'
*/
searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TagController::search
* @see app/Http/Controllers/TagController.php:21
* @route '/api/tags/search'
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
* @see \App\Http\Controllers\TagController::list
* @see app/Http/Controllers/TagController.php:136
* @route '/api/tags'
*/
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/tags',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TagController::list
* @see app/Http/Controllers/TagController.php:136
* @route '/api/tags'
*/
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TagController::list
* @see app/Http/Controllers/TagController.php:136
* @route '/api/tags'
*/
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TagController::list
* @see app/Http/Controllers/TagController.php:136
* @route '/api/tags'
*/
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TagController::list
* @see app/Http/Controllers/TagController.php:136
* @route '/api/tags'
*/
const listForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TagController::list
* @see app/Http/Controllers/TagController.php:136
* @route '/api/tags'
*/
listForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TagController::list
* @see app/Http/Controllers/TagController.php:136
* @route '/api/tags'
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

/**
* @see \App\Http\Controllers\TagController::storeApi
* @see app/Http/Controllers/TagController.php:150
* @route '/api/tags'
*/
export const storeApi = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeApi.url(options),
    method: 'post',
})

storeApi.definition = {
    methods: ["post"],
    url: '/api/tags',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TagController::storeApi
* @see app/Http/Controllers/TagController.php:150
* @route '/api/tags'
*/
storeApi.url = (options?: RouteQueryOptions) => {
    return storeApi.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TagController::storeApi
* @see app/Http/Controllers/TagController.php:150
* @route '/api/tags'
*/
storeApi.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeApi.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TagController::storeApi
* @see app/Http/Controllers/TagController.php:150
* @route '/api/tags'
*/
const storeApiForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeApi.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TagController::storeApi
* @see app/Http/Controllers/TagController.php:150
* @route '/api/tags'
*/
storeApiForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeApi.url(options),
    method: 'post',
})

storeApi.form = storeApiForm

const tags = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    search: Object.assign(search, search),
    list: Object.assign(list, list),
    storeApi: Object.assign(storeApi, storeApi),
}

export default tags