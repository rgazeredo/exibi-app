import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MediaController::show
* @see app/Http/Controllers/MediaController.php:283
* @route '/api/media/{media}'
*/
export const show = (args: { media: string | { id: string } } | [media: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/media/{media}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MediaController::show
* @see app/Http/Controllers/MediaController.php:283
* @route '/api/media/{media}'
*/
show.url = (args: { media: string | { id: string } } | [media: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{media}', parsedArgs.media.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MediaController::show
* @see app/Http/Controllers/MediaController.php:283
* @route '/api/media/{media}'
*/
show.get = (args: { media: string | { id: string } } | [media: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::show
* @see app/Http/Controllers/MediaController.php:283
* @route '/api/media/{media}'
*/
show.head = (args: { media: string | { id: string } } | [media: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MediaController::show
* @see app/Http/Controllers/MediaController.php:283
* @route '/api/media/{media}'
*/
const showForm = (args: { media: string | { id: string } } | [media: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::show
* @see app/Http/Controllers/MediaController.php:283
* @route '/api/media/{media}'
*/
showForm.get = (args: { media: string | { id: string } } | [media: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MediaController::show
* @see app/Http/Controllers/MediaController.php:283
* @route '/api/media/{media}'
*/
showForm.head = (args: { media: string | { id: string } } | [media: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

const api = {
    show: Object.assign(show, show),
}

export default api