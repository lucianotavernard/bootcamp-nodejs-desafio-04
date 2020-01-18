'use strict'

class ForgotPasswordStore {
  get rules () {
    return {
      token: 'required',
      password: 'required|confirmed'
    }
  }
}

module.exports = ForgotPasswordStore
