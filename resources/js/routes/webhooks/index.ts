import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\WidgetWebhookController::widget
* @see app/Http/Controllers/Api/WidgetWebhookController.php:24
* @route '/api/webhooks/widget'
*/
export const widget = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: widget.url(options),
    method: 'post',
})

widget.definition = {
    methods: ["post"],
    url: '/api/webhooks/widget',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\WidgetWebhookController::widget
* @see app/Http/Controllers/Api/WidgetWebhookController.php:24
* @route '/api/webhooks/widget'
*/
widget.url = (options?: RouteQueryOptions) => {
    return widget.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\WidgetWebhookController::widget
* @see app/Http/Controllers/Api/WidgetWebhookController.php:24
* @route '/api/webhooks/widget'
*/
widget.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: widget.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\WidgetWebhookController::widget
* @see app/Http/Controllers/Api/WidgetWebhookController.php:24
* @route '/api/webhooks/widget'
*/
const widgetForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: widget.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\WidgetWebhookController::widget
* @see app/Http/Controllers/Api/WidgetWebhookController.php:24
* @route '/api/webhooks/widget'
*/
widgetForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: widget.url(options),
    method: 'post',
})

widget.form = widgetForm

/**
* @see \App\Http\Controllers\Api\SoketiWebhookController::soketi
* @see app/Http/Controllers/Api/SoketiWebhookController.php:26
* @route '/api/webhooks/soketi'
*/
export const soketi = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: soketi.url(options),
    method: 'post',
})

soketi.definition = {
    methods: ["post"],
    url: '/api/webhooks/soketi',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SoketiWebhookController::soketi
* @see app/Http/Controllers/Api/SoketiWebhookController.php:26
* @route '/api/webhooks/soketi'
*/
soketi.url = (options?: RouteQueryOptions) => {
    return soketi.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SoketiWebhookController::soketi
* @see app/Http/Controllers/Api/SoketiWebhookController.php:26
* @route '/api/webhooks/soketi'
*/
soketi.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: soketi.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SoketiWebhookController::soketi
* @see app/Http/Controllers/Api/SoketiWebhookController.php:26
* @route '/api/webhooks/soketi'
*/
const soketiForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: soketi.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SoketiWebhookController::soketi
* @see app/Http/Controllers/Api/SoketiWebhookController.php:26
* @route '/api/webhooks/soketi'
*/
soketiForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: soketi.url(options),
    method: 'post',
})

soketi.form = soketiForm

const webhooks = {
    widget: Object.assign(widget, widget),
    soketi: Object.assign(soketi, soketi),
}

export default webhooks