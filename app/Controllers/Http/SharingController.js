'use strict'

const { parseISO, format } = require('date-fns')

const Event = use('App/Models/Event')

const Kue = use('Kue')
const Job = use('App/Jobs/SharedEventMail')

class SharingController {
  async store ({ params, request, response, auth }) {
    try {
      const event = await Event.findOrFail(params.id)

      if (event.user_id !== auth.user.id) {
        return response.status(401).send({
          error: {
            message: 'Just the event owner can share it'
          }
        })
      }

      const email = request.input('email')

      Kue.dispatch(
        Job.key,
        {
          email,
          event: {
            ...event,
            formatted_date: format(parseISO(event.time), 'YYYY-MM-DD'),
            formatted_time: format(parseISO(event.time), 'LTS')
          },
          sender: auth.user
        },
        {
          attempts: 3
        }
      )
    } catch (error) {
      return response
        .status(error.status)
        .send({
          error: {
            message: 'Event not found'
          }
        })
    }
  }
}

module.exports = SharingController
