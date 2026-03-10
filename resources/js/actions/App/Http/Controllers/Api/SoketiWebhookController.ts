import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
26
* @route '/api/webhooks/soketi'
*/
export const handle = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(options),
    method: 'post',
})

handle.definition = {
    methods: ["post"],
    url: '/api/webhooks/soketi',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SoketiWebhookController::handle
* @see app/Http/Controllers/Api/SoketiWebhookController.php:26
* @route '/api/webhooks/soketi'
*/
handle.url = (options?: RouteQueryOptions) => {
    return handle.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SoketiWebhookController::handle
* @see app/Http/Controllers/Api/SoketiWebhookController.php:26
* @route '/api/webhooks/soketi'
*/
handle.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SoketiWebhookController::handle
* @see app/Http/Controllers/Api/SoketiWebhookController.php:26
* @route '/api/webhooks/soketi'
*/
const handleForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handle.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SoketiWebhookController::handle
* @see app/Http/Controllers/Api/SoketiWebhookController.php:26
* @route '/api/webhooks/soketi'
*/
handleForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handle.url(options),
    method: 'post',
})

handle.form = handleForm

const SoketiWebhookController = { handle }

export default SoketiWebhookController