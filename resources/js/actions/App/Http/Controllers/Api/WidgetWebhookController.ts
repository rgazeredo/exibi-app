import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\WidgetWebhookController::handle
* @see app/Http/Controllers/Api/WidgetWebhookController.php:24
* @route '/api/webhooks/widget'
*/
export const handle = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(options),
    method: 'post',
})

handle.definition = {
    methods: ["post"],
    url: '/api/webhooks/widget',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\WidgetWebhookController::handle
* @see app/Http/Controllers/Api/WidgetWebhookController.php:24
* @route '/api/webhooks/widget'
*/
handle.url = (options?: RouteQueryOptions) => {
    return handle.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\WidgetWebhookController::handle
* @see app/Http/Controllers/Api/WidgetWebhookController.php:24
* @route '/api/webhooks/widget'
*/
handle.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\WidgetWebhookController::handle
* @see app/Http/Controllers/Api/WidgetWebhookController.php:24
* @route '/api/webhooks/widget'
*/
const handleForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handle.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\WidgetWebhookController::handle
* @see app/Http/Controllers/Api/WidgetWebhookController.php:24
* @route '/api/webhooks/widget'
*/
handleForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handle.url(options),
    method: 'post',
})

handle.form = handleForm

const WidgetWebhookController = { handle }

export default WidgetWebhookController