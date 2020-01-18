'use strict'

const Mail = use('Mail')

class ForgotPasswordMail {
  static get key () {
    return 'ForgotPasswordMail-key'
  }

  async handle (data) {
    await Mail.send(
      'emails.forgot_password',
      data,
      message => {
        message
          .to(data.email)
          .from('contact@rocketseat.com.br', 'Event | Rocketseat')
          .subject('Password reset')
      }
    )
  }
}

module.exports = ForgotPasswordMail
