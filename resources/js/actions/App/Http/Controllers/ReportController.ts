import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ReportController::index
* @see app/Http/Controllers/ReportController.php:19
* @route '/reports'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReportController::index
* @see app/Http/Controllers/ReportController.php:19
* @route '/reports'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReportController::index
* @see app/Http/Controllers/ReportController.php:19
* @route '/reports'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::index
* @see app/Http/Controllers/ReportController.php:19
* @route '/reports'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ReportController::index
* @see app/Http/Controllers/ReportController.php:19
* @route '/reports'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::index
* @see app/Http/Controllers/ReportController.php:19
* @route '/reports'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::index
* @see app/Http/Controllers/ReportController.php:19
* @route '/reports'
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
* @see \App\Http\Controllers\ReportController::logsIndex
* @see app/Http/Controllers/ReportController.php:33
* @route '/reports/logs'
*/
export const logsIndex = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logsIndex.url(options),
    method: 'get',
})

logsIndex.definition = {
    methods: ["get","head"],
    url: '/reports/logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReportController::logsIndex
* @see app/Http/Controllers/ReportController.php:33
* @route '/reports/logs'
*/
logsIndex.url = (options?: RouteQueryOptions) => {
    return logsIndex.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReportController::logsIndex
* @see app/Http/Controllers/ReportController.php:33
* @route '/reports/logs'
*/
logsIndex.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logsIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::logsIndex
* @see app/Http/Controllers/ReportController.php:33
* @route '/reports/logs'
*/
logsIndex.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: logsIndex.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ReportController::logsIndex
* @see app/Http/Controllers/ReportController.php:33
* @route '/reports/logs'
*/
const logsIndexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: logsIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::logsIndex
* @see app/Http/Controllers/ReportController.php:33
* @route '/reports/logs'
*/
logsIndexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: logsIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::logsIndex
* @see app/Http/Controllers/ReportController.php:33
* @route '/reports/logs'
*/
logsIndexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: logsIndex.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

logsIndex.form = logsIndexForm

/**
* @see \App\Http\Controllers\ReportController::eventsIndex
* @see app/Http/Controllers/ReportController.php:303
* @route '/reports/events'
*/
export const eventsIndex = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: eventsIndex.url(options),
    method: 'get',
})

eventsIndex.definition = {
    methods: ["get","head"],
    url: '/reports/events',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReportController::eventsIndex
* @see app/Http/Controllers/ReportController.php:303
* @route '/reports/events'
*/
eventsIndex.url = (options?: RouteQueryOptions) => {
    return eventsIndex.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReportController::eventsIndex
* @see app/Http/Controllers/ReportController.php:303
* @route '/reports/events'
*/
eventsIndex.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: eventsIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::eventsIndex
* @see app/Http/Controllers/ReportController.php:303
* @route '/reports/events'
*/
eventsIndex.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: eventsIndex.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ReportController::eventsIndex
* @see app/Http/Controllers/ReportController.php:303
* @route '/reports/events'
*/
const eventsIndexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: eventsIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::eventsIndex
* @see app/Http/Controllers/ReportController.php:303
* @route '/reports/events'
*/
eventsIndexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: eventsIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::eventsIndex
* @see app/Http/Controllers/ReportController.php:303
* @route '/reports/events'
*/
eventsIndexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: eventsIndex.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

eventsIndex.form = eventsIndexForm

/**
* @see \App\Http\Controllers\ReportController::data
* @see app/Http/Controllers/ReportController.php:66
* @route '/api/reports/data'
*/
export const data = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})

data.definition = {
    methods: ["get","head"],
    url: '/api/reports/data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReportController::data
* @see app/Http/Controllers/ReportController.php:66
* @route '/api/reports/data'
*/
data.url = (options?: RouteQueryOptions) => {
    return data.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReportController::data
* @see app/Http/Controllers/ReportController.php:66
* @route '/api/reports/data'
*/
data.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::data
* @see app/Http/Controllers/ReportController.php:66
* @route '/api/reports/data'
*/
data.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: data.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ReportController::data
* @see app/Http/Controllers/ReportController.php:66
* @route '/api/reports/data'
*/
const dataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: data.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::data
* @see app/Http/Controllers/ReportController.php:66
* @route '/api/reports/data'
*/
dataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: data.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::data
* @see app/Http/Controllers/ReportController.php:66
* @route '/api/reports/data'
*/
dataForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: data.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

data.form = dataForm

/**
* @see \App\Http\Controllers\ReportController::logs
* @see app/Http/Controllers/ReportController.php:183
* @route '/api/reports/logs'
*/
export const logs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logs.url(options),
    method: 'get',
})

logs.definition = {
    methods: ["get","head"],
    url: '/api/reports/logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReportController::logs
* @see app/Http/Controllers/ReportController.php:183
* @route '/api/reports/logs'
*/
logs.url = (options?: RouteQueryOptions) => {
    return logs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReportController::logs
* @see app/Http/Controllers/ReportController.php:183
* @route '/api/reports/logs'
*/
logs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logs.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::logs
* @see app/Http/Controllers/ReportController.php:183
* @route '/api/reports/logs'
*/
logs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: logs.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ReportController::logs
* @see app/Http/Controllers/ReportController.php:183
* @route '/api/reports/logs'
*/
const logsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: logs.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::logs
* @see app/Http/Controllers/ReportController.php:183
* @route '/api/reports/logs'
*/
logsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: logs.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::logs
* @see app/Http/Controllers/ReportController.php:183
* @route '/api/reports/logs'
*/
logsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: logs.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

logs.form = logsForm

/**
* @see \App\Http\Controllers\ReportController::events
* @see app/Http/Controllers/ReportController.php:354
* @route '/api/reports/events'
*/
export const events = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: events.url(options),
    method: 'get',
})

events.definition = {
    methods: ["get","head"],
    url: '/api/reports/events',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReportController::events
* @see app/Http/Controllers/ReportController.php:354
* @route '/api/reports/events'
*/
events.url = (options?: RouteQueryOptions) => {
    return events.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReportController::events
* @see app/Http/Controllers/ReportController.php:354
* @route '/api/reports/events'
*/
events.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: events.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::events
* @see app/Http/Controllers/ReportController.php:354
* @route '/api/reports/events'
*/
events.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: events.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ReportController::events
* @see app/Http/Controllers/ReportController.php:354
* @route '/api/reports/events'
*/
const eventsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: events.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::events
* @see app/Http/Controllers/ReportController.php:354
* @route '/api/reports/events'
*/
eventsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: events.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportController::events
* @see app/Http/Controllers/ReportController.php:354
* @route '/api/reports/events'
*/
eventsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: events.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

events.form = eventsForm

const ReportController = { index, logsIndex, eventsIndex, data, logs, events }

export default ReportController