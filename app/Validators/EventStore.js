'use strict'

class EventStore {
  get rules () {
    return {
      title: 'required',
      place: 'required',
      time: 'required|date'
    }
  }
}

module.exports = EventStore
