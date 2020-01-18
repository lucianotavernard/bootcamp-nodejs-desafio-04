'use strict'

const { isAfter, parseISO } = require('date-fns')

const Event = use('App/Models/Event')

class EventController {
  async index ({ request }) {
    const { page, date } = request.get()

    const events = Event.query()
      .with('user')
      .whereRaw('"time"::date = ?', date)
      .paginate(page)

    return events
  }

  async store ({ request, response, auth }) {
    const data = request.all(['title', 'place', 'time'])

    const existingEvent = await Event.findBy('time', data.time)

    if (existingEvent) {
      return response.status(401).send({
        error: {
          message: 'There is another event at this time already'
        }
      })
    }

    const event = await Event.create({ ...data, user_id: auth.user.id })

    return event
  }

  async show ({ params, request, response, auth }) {
    try {
      const event = await Event.findOrFail(params.id)

      if (event.user_id !== auth.user.id) {
        return response.status(401).send({
          error: {
            message: 'Only the event owner can see it.'
          }
        })
      }

      return event
    } catch (error) {
      return response
        .status(error.status)
        .send({ error: { message: 'Event not found' } })
    }
  }

  async update ({ params, request, response, auth }) {
    const event = await Event.findOrFail(params.id)

    if (event.user_id !== auth.user.id) {
      return response.status(401).send({
        error: {
          message: 'Only the event owner can edit it'
        }
      })
    }

    const passed = isAfter(parseISO(event.time), new Date())

    if (passed) {
      return response.status(401).send({
        error: {
          message: 'You can not edit past events'
        }
      })
    }

    const data = request.only(['title', 'place', 'time'])

    if (data.time) {
      const existingEvent = await Event.findBy('time', data.time)

      if (existingEvent && existingEvent.id !== Number(params.id)) {
        return response.status(401).send({
          error: {
            message: 'There is another event at this time already'
          }
        })
      }
    }

    event.merge(data)

    await event.save()

    return event
  }

  async destroy ({ params, response, auth }) {
    const event = await Event.findOrFail(params.id)

    if (event.user_id !== auth.user.id) {
      return response.status(401).send({
        error: {
          message: 'Only the event owner can delete it.'
        }
      })
    }

    const passed = isAfter(parseISO(event.time), new Date())

    if (passed) {
      return response.status(401).send({
        error: {
          message: 'You can not delete past events.'
        }
      })
    }

    await event.delete()
  }
}

module.exports = EventController
