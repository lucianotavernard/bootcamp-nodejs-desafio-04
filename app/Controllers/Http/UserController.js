'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')

class UserController {
  async store ({ request }) {
    const data = request.only(['username', 'email', 'password'])

    const user = await User.create(data)

    return user
  }

  async update ({ request, auth, response }) {
    const { password: currPassword } = auth.user
    const { username, old_password: oldPassword, password } = request.only([
      'username',
      'password',
      'oldPassword'
    ])

    if (oldPassword && !(await Hash.verify(oldPassword, currPassword))) {
      return response.status(401).send({
        error: {
          message: 'Password does not match.'
        }
      })
    }

    const data = {
      ...(username) && { username },
      ...(password) && { password }
    }

    auth.user.merge(data)

    await auth.user.save()

    return auth.user
  }
}

module.exports = UserController
