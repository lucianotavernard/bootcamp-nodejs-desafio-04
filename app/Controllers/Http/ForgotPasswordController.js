'use strict'

const { subDays, isAfter, parseISO } = require('date-fns')
const crypto = require('crypto')

const User = use('App/Models/User')

const Kue = use('Kue')
const Job = use('App/Jobs/ForgotPasswordMail')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')
      const user = await User.findByOrFail('email', email)

      await user.save({
        token: crypto.randomBytes(10).toString('hex'),
        token_created_at: new Date()
      })

      const link = `${request.input('redirect_url')}?token=${user.token}`

      Kue.dispatch(
        Job.key,
        { email, token: user.token, link },
        { attempts: 3 }
      )
    } catch (error) {
      return response.status(error.status).send({
        error: {
          message: 'Something went wrong. Does this email exist?'
        }
      })
    }
  }

  async update ({ request, response }) {
    try {
      const { token, password } = request.all()

      const user = await User.findByOrFail('token', token)
      const { token_created_at: tokenCreatedAt } = user

      const tokenExpired = isAfter(parseISO(tokenCreatedAt), subDays(new Date(), 2))

      if (tokenExpired) {
        return response.status(401).send({
          error: {
            message: 'Token expired'
          }
        })
      }

      await user.update({ token: null, token_created_at: null, password })
    } catch (error) {
      return response.status(error.status).send({
        error: {
          message: 'Something went wrong when trying to reset the password'
        }
      })
    }
  }
}

module.exports = ForgotPasswordController
