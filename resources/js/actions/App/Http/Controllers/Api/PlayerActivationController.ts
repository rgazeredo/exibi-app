import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PlayerActivationController::requestActivation
* @see app/Http/Controllers/Api/PlayerActivationController.php:25
* @route '/api/v1/player/request-activation'
*/
export const requestActivation = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestActivation.url(options),
    method: 'post',
})

requestActivation.definition = {
    methods: ["post"],
    url: '/api/v1/player/request-activation',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::requestActivation
* @see app/Http/Controllers/Api/PlayerActivationController.php:25
* @route '/api/v1/player/request-activation'
*/
requestActivation.url = (options?: RouteQueryOptions) => {
    return requestActivation.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::requestActivation
* @see app/Http/Controllers/Api/PlayerActivationController.php:25
* @route '/api/v1/player/request-activation'
*/
requestActivation.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestActivation.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::requestActivation
* @see app/Http/Controllers/Api/PlayerActivationController.php:25
* @route '/api/v1/player/request-activation'
*/
const requestActivationForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: requestActivation.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::requestActivation
* @see app/Http/Controllers/Api/PlayerActivationController.php:25
* @route '/api/v1/player/request-activation'
*/
requestActivationForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: requestActivation.url(options),
    method: 'post',
})

requestActivation.form = requestActivationForm

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::checkActivation
* @see app/Http/Controllers/Api/PlayerActivationController.php:46
* @route '/api/v1/player/check-activation'
*/
export const checkActivation = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkActivation.url(options),
    method: 'post',
})

checkActivation.definition = {
    methods: ["post"],
    url: '/api/v1/player/check-activation',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::checkActivation
* @see app/Http/Controllers/Api/PlayerActivationController.php:46
* @route '/api/v1/player/check-activation'
*/
checkActivation.url = (options?: RouteQueryOptions) => {
    return checkActivation.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::checkActivation
* @see app/Http/Controllers/Api/PlayerActivationController.php:46
* @route '/api/v1/player/check-activation'
*/
checkActivation.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkActivation.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::checkActivation
* @see app/Http/Controllers/Api/PlayerActivationController.php:46
* @route '/api/v1/player/check-activation'
*/
const checkActivationForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkActivation.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::checkActivation
* @see app/Http/Controllers/Api/PlayerActivationController.php:46
* @route '/api/v1/player/check-activation'
*/
checkActivationForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkActivation.url(options),
    method: 'post',
})

checkActivation.form = checkActivationForm

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::playlist
* @see app/Http/Controllers/Api/PlayerActivationController.php:102
* @route '/api/v1/player/playlist'
*/
export const playlist = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: playlist.url(options),
    method: 'get',
})

playlist.definition = {
    methods: ["get","head"],
    url: '/api/v1/player/playlist',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::playlist
* @see app/Http/Controllers/Api/PlayerActivationController.php:102
* @route '/api/v1/player/playlist'
*/
playlist.url = (options?: RouteQueryOptions) => {
    return playlist.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::playlist
* @see app/Http/Controllers/Api/PlayerActivationController.php:102
* @route '/api/v1/player/playlist'
*/
playlist.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: playlist.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::playlist
* @see app/Http/Controllers/Api/PlayerActivationController.php:102
* @route '/api/v1/player/playlist'
*/
playlist.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: playlist.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::playlist
* @see app/Http/Controllers/Api/PlayerActivationController.php:102
* @route '/api/v1/player/playlist'
*/
const playlistForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: playlist.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::playlist
* @see app/Http/Controllers/Api/PlayerActivationController.php:102
* @route '/api/v1/player/playlist'
*/
playlistForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: playlist.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::playlist
* @see app/Http/Controllers/Api/PlayerActivationController.php:102
* @route '/api/v1/player/playlist'
*/
playlistForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: playlist.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

playlist.form = playlistForm

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::heartbeat
* @see app/Http/Controllers/Api/PlayerActivationController.php:352
* @route '/api/v1/player/heartbeat'
*/
export const heartbeat = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: heartbeat.url(options),
    method: 'post',
})

heartbeat.definition = {
    methods: ["post"],
    url: '/api/v1/player/heartbeat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::heartbeat
* @see app/Http/Controllers/Api/PlayerActivationController.php:352
* @route '/api/v1/player/heartbeat'
*/
heartbeat.url = (options?: RouteQueryOptions) => {
    return heartbeat.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::heartbeat
* @see app/Http/Controllers/Api/PlayerActivationController.php:352
* @route '/api/v1/player/heartbeat'
*/
heartbeat.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: heartbeat.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::heartbeat
* @see app/Http/Controllers/Api/PlayerActivationController.php:352
* @route '/api/v1/player/heartbeat'
*/
const heartbeatForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: heartbeat.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::heartbeat
* @see app/Http/Controllers/Api/PlayerActivationController.php:352
* @route '/api/v1/player/heartbeat'
*/
heartbeatForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: heartbeat.url(options),
    method: 'post',
})

heartbeat.form = heartbeatForm

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::log
* @see app/Http/Controllers/Api/PlayerActivationController.php:459
* @route '/api/v1/player/log'
*/
export const log = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: log.url(options),
    method: 'post',
})

log.definition = {
    methods: ["post"],
    url: '/api/v1/player/log',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::log
* @see app/Http/Controllers/Api/PlayerActivationController.php:459
* @route '/api/v1/player/log'
*/
log.url = (options?: RouteQueryOptions) => {
    return log.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::log
* @see app/Http/Controllers/Api/PlayerActivationController.php:459
* @route '/api/v1/player/log'
*/
log.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: log.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::log
* @see app/Http/Controllers/Api/PlayerActivationController.php:459
* @route '/api/v1/player/log'
*/
const logForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: log.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::log
* @see app/Http/Controllers/Api/PlayerActivationController.php:459
* @route '/api/v1/player/log'
*/
logForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: log.url(options),
    method: 'post',
})

log.form = logForm

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::events
* @see app/Http/Controllers/Api/PlayerActivationController.php:522
* @route '/api/v1/player/events'
*/
export const events = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: events.url(options),
    method: 'post',
})

events.definition = {
    methods: ["post"],
    url: '/api/v1/player/events',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::events
* @see app/Http/Controllers/Api/PlayerActivationController.php:522
* @route '/api/v1/player/events'
*/
events.url = (options?: RouteQueryOptions) => {
    return events.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::events
* @see app/Http/Controllers/Api/PlayerActivationController.php:522
* @route '/api/v1/player/events'
*/
events.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: events.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::events
* @see app/Http/Controllers/Api/PlayerActivationController.php:522
* @route '/api/v1/player/events'
*/
const eventsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: events.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::events
* @see app/Http/Controllers/Api/PlayerActivationController.php:522
* @route '/api/v1/player/events'
*/
eventsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: events.url(options),
    method: 'post',
})

events.form = eventsForm

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::uploadScreenshot
* @see app/Http/Controllers/Api/PlayerActivationController.php:603
* @route '/api/v1/player/screenshot'
*/
export const uploadScreenshot = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadScreenshot.url(options),
    method: 'post',
})

uploadScreenshot.definition = {
    methods: ["post"],
    url: '/api/v1/player/screenshot',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::uploadScreenshot
* @see app/Http/Controllers/Api/PlayerActivationController.php:603
* @route '/api/v1/player/screenshot'
*/
uploadScreenshot.url = (options?: RouteQueryOptions) => {
    return uploadScreenshot.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::uploadScreenshot
* @see app/Http/Controllers/Api/PlayerActivationController.php:603
* @route '/api/v1/player/screenshot'
*/
uploadScreenshot.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadScreenshot.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::uploadScreenshot
* @see app/Http/Controllers/Api/PlayerActivationController.php:603
* @route '/api/v1/player/screenshot'
*/
const uploadScreenshotForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: uploadScreenshot.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PlayerActivationController::uploadScreenshot
* @see app/Http/Controllers/Api/PlayerActivationController.php:603
* @route '/api/v1/player/screenshot'
*/
uploadScreenshotForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: uploadScreenshot.url(options),
    method: 'post',
})

uploadScreenshot.form = uploadScreenshotForm

const PlayerActivationController = { requestActivation, checkActivation, playlist, heartbeat, log, events, uploadScreenshot }

export default PlayerActivationController