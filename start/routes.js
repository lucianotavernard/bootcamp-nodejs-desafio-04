'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.post('users', 'UserController.store').validator('UserStore')
Route.post('sessions', 'SessionController.store').validator('SessionStore')

Route.post('passwords', 'ForgotPasswordController.store').validator(
  'ForgotPasswordStore'
)
Route.put('passwords', 'ForgotPasswordController.update').validator(
  'ForgotPasswordUpdate'
)

Route.group(() => {
  Route.resource('events', 'EventController')
    .apiOnly()
    .validator(new Map([[['events.store'], ['EventStore']]]))

  Route.post('events/:id/share', 'SharingController.store')

  Route.put('users', 'UserController.update')
}).middleware(['auth'])
