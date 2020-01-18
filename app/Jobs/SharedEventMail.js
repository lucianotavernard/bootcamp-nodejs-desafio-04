'use strict'

const Mail = use('Mail')

class SharedEventMail {
  static get key () {
    return 'SharedEventMail-key'
  }

  async handle (data) {
    await Mail.send(
      'emails.shared_event',
      data,
      message => {
        message
          .to(data.email)
          .from('contact@rocketseat.com.br', 'Event | Rocketseat')
          .subject('An event was shared with you')
      })

    return data
  }
}

module.exports = SharedEventMail
