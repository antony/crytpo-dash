'use strict'

const got = require('got')
const moment = require('moment')
const { reach } = require('hoek')
const { Promise } = require('bluebird')

class CryptocompareDatasource {

  constructor (options) {
    this.symbol = options.symbol
  }

  getTimestamp (daysAgo) {
    return moment().subtract(daysAgo, 'days').unix()
  }

  getData (ts) {
    return got(
      `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${this.symbol}&tsyms=GBP&ts=${ts}`,
      { json: true }
    )
  }

  fetch () {
    return Promise.map([7,6,5,4,3,2,1], daysAgo => {
      const timestamp = this.getTimestamp(daysAgo)
      
      return this.getData(timestamp)
      .then(({ body }) => {
        return reach(body, `${this.symbol}.GBP`)
      })
    })
    .then(data => {
      return Promise.resolve({ [this.symbol]: data })
    })
  }
}

exports.register = function (engine) {
  engine.contributeDatasource(CryptocompareDatasource)
}