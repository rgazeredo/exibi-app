import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\WidgetController::index
* @see app/Http/Controllers/Admin/WidgetController.php:22
* @route '/admin/widgets'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/widgets',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\WidgetController::index
* @see app/Http/Controllers/Admin/WidgetController.php:22
* @route '/admin/widgets'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\WidgetController::index
* @see app/Http/Controllers/Admin/WidgetController.php:22
* @route '/admin/widgets'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::index
* @see app/Http/Controllers/Admin/WidgetController.php:22
* @route '/admin/widgets'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::index
* @see app/Http/Controllers/Admin/WidgetController.php:22
* @route '/admin/widgets'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::index
* @see app/Http/Controllers/Admin/WidgetController.php:22
* @route '/admin/widgets'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::index
* @see app/Http/Controllers/Admin/WidgetController.php:22
* @route '/admin/widgets'
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
* @see \App\Http\Controllers\Admin\WidgetController::search
* @see app/Http/Controllers/Admin/WidgetController.php:47
* @route '/admin/api/widgets/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/admin/api/widgets/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\WidgetController::search
* @see app/Http/Controllers/Admin/WidgetController.php:47
* @route '/admin/api/widgets/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\WidgetController::search
* @see app/Http/Controllers/Admin/WidgetController.php:47
* @route '/admin/api/widgets/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::search
* @see app/Http/Controllers/Admin/WidgetController.php:47
* @route '/admin/api/widgets/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::search
* @see app/Http/Controllers/Admin/WidgetController.php:47
* @route '/admin/api/widgets/search'
*/
const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::search
* @see app/Http/Controllers/Admin/WidgetController.php:47
* @route '/admin/api/widgets/search'
*/
searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::search
* @see app/Http/Controllers/Admin/WidgetController.php:47
* @route '/admin/api/widgets/search'
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
* @see \App\Http\Controllers\Admin\WidgetController::store
* @see app/Http/Controllers/Admin/WidgetController.php:157
* @route '/admin/widgets'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/widgets',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\WidgetController::store
* @see app/Http/Controllers/Admin/WidgetController.php:157
* @route '/admin/widgets'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\WidgetController::store
* @see app/Http/Controllers/Admin/WidgetController.php:157
* @route '/admin/widgets'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::store
* @see app/Http/Controllers/Admin/WidgetController.php:157
* @route '/admin/widgets'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::store
* @see app/Http/Controllers/Admin/WidgetController.php:157
* @route '/admin/widgets'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\WidgetController::update
* @see app/Http/Controllers/Admin/WidgetController.php:211
* @route '/admin/widgets/{widget}'
*/
export const update = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/admin/widgets/{widget}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\WidgetController::update
* @see app/Http/Controllers/Admin/WidgetController.php:211
* @route '/admin/widgets/{widget}'
*/
update.url = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { widget: args }
    }

    if (Array.isArray(args)) {
        args = {
            widget: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        widget: args.widget,
    }

    return update.definition.url
            .replace('{widget}', parsedArgs.widget.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\WidgetController::update
* @see app/Http/Controllers/Admin/WidgetController.php:211
* @route '/admin/widgets/{widget}'
*/
update.patch = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::update
* @see app/Http/Controllers/Admin/WidgetController.php:211
* @route '/admin/widgets/{widget}'
*/
const updateForm = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::update
* @see app/Http/Controllers/Admin/WidgetController.php:211
* @route '/admin/widgets/{widget}'
*/
updateForm.patch = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\WidgetController::destroy
* @see app/Http/Controllers/Admin/WidgetController.php:250
* @route '/admin/widgets/{widget}'
*/
export const destroy = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/widgets/{widget}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\WidgetController::destroy
* @see app/Http/Controllers/Admin/WidgetController.php:250
* @route '/admin/widgets/{widget}'
*/
destroy.url = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { widget: args }
    }

    if (Array.isArray(args)) {
        args = {
            widget: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        widget: args.widget,
    }

    return destroy.definition.url
            .replace('{widget}', parsedArgs.widget.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\WidgetController::destroy
* @see app/Http/Controllers/Admin/WidgetController.php:250
* @route '/admin/widgets/{widget}'
*/
destroy.delete = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::destroy
* @see app/Http/Controllers/Admin/WidgetController.php:250
* @route '/admin/widgets/{widget}'
*/
const destroyForm = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::destroy
* @see app/Http/Controllers/Admin/WidgetController.php:250
* @route '/admin/widgets/{widget}'
*/
destroyForm.delete = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\WidgetController::regenerate
* @see app/Http/Controllers/Admin/WidgetController.php:112
* @route '/admin/widgets/{widget}/regenerate'
*/
export const regenerate = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(args, options),
    method: 'post',
})

regenerate.definition = {
    methods: ["post"],
    url: '/admin/widgets/{widget}/regenerate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\WidgetController::regenerate
* @see app/Http/Controllers/Admin/WidgetController.php:112
* @route '/admin/widgets/{widget}/regenerate'
*/
regenerate.url = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { widget: args }
    }

    if (Array.isArray(args)) {
        args = {
            widget: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        widget: args.widget,
    }

    return regenerate.definition.url
            .replace('{widget}', parsedArgs.widget.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\WidgetController::regenerate
* @see app/Http/Controllers/Admin/WidgetController.php:112
* @route '/admin/widgets/{widget}/regenerate'
*/
regenerate.post = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::regenerate
* @see app/Http/Controllers/Admin/WidgetController.php:112
* @route '/admin/widgets/{widget}/regenerate'
*/
const regenerateForm = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::regenerate
* @see app/Http/Controllers/Admin/WidgetController.php:112
* @route '/admin/widgets/{widget}/regenerate'
*/
regenerateForm.post = (args: { widget: string | number } | [widget: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerate.url(args, options),
    method: 'post',
})

regenerate.form = regenerateForm

/**
* @see \App\Http\Controllers\Admin\WidgetController::regenerateAll
* @see app/Http/Controllers/Admin/WidgetController.php:276
* @route '/admin/widgets/regenerate-all'
*/
export const regenerateAll = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateAll.url(options),
    method: 'post',
})

regenerateAll.definition = {
    methods: ["post"],
    url: '/admin/widgets/regenerate-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\WidgetController::regenerateAll
* @see app/Http/Controllers/Admin/WidgetController.php:276
* @route '/admin/widgets/regenerate-all'
*/
regenerateAll.url = (options?: RouteQueryOptions) => {
    return regenerateAll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\WidgetController::regenerateAll
* @see app/Http/Controllers/Admin/WidgetController.php:276
* @route '/admin/widgets/regenerate-all'
*/
regenerateAll.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateAll.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::regenerateAll
* @see app/Http/Controllers/Admin/WidgetController.php:276
* @route '/admin/widgets/regenerate-all'
*/
const regenerateAllForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerateAll.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\WidgetController::regenerateAll
* @see app/Http/Controllers/Admin/WidgetController.php:276
* @route '/admin/widgets/regenerate-all'
*/
regenerateAllForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerateAll.url(options),
    method: 'post',
})

regenerateAll.form = regenerateAllForm

const widgets = {
    index: Object.assign(index, index),
    search: Object.assign(search, search),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    regenerate: Object.assign(regenerate, regenerate),
    regenerateAll: Object.assign(regenerateAll, regenerateAll),
}

export default widgets