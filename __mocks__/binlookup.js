"use strict";
// __mocks__/binlookup.js
/**
 * Author: Jarred Jacobs
 * Email: jarred.jacobs@gmail.com
 * Date: 2020-01-11
 *
 */
var defined = require("defined");

module.exports = binlookup;

function binlookup(opts) {
  if (typeof opts === "string")
    opts = {
      key: opts,
    };

  if (typeof opts === "undefined") opts = {};

  var url = defined(opts.url, "https://lookup.binlist.net/");

  var Promise = defined(opts.Promise, global.Promise);

  let response = {};
  let responses = {
    visa: {
      number: {length: 16, luhn: null},
      scheme: "visa",
      type: null,
      brand: null,
    },
    mastercard: {
      number: {},
      scheme: "mastercard",
      type: null,
      brand: null,
      prepaid: true,
      bank: null,
    },
    discover: {
      number: {},
      scheme: "discover",
      type: "credit",
      bank: {},
    },
    amex: {
      number: {},
      scheme: "amex",
      type: "credit",
      brand: "american express",
    },
    generic: {},
  };

  return function(cardNumber, cb) {
    console.log(`Binlookup Mock: Card Number: ${cardNumber}`);

    let visaRegEx = new RegExp(`^4[0-9]{2,15}`);
    let mcRegEx = new RegExp(`^5[1-5][0-9]{1,14}`);
    let discRegEx = new RegExp(`^6(011|5[0-9]{2})[0-9]{1,11}`);
    let amexRegEx = new RegExp(`^3[47][0-9]{1,13}`);

    let cardType = "generic";
    response = responses[cardType];
    if (cardNumber.match(visaRegEx)) {
      cardType = "visa";
      response = responses[cardType];
    } else if (cardNumber.match(mcRegEx)) {
      cardType = "mastercard";
      response = responses[cardType];
    } else if (cardNumber.match(discRegEx)) {
      cardType = "discover";
      response = responses[cardType];
    } else if (cardNumber.match(amexRegEx)) {
      cardType = "amex";
      response = responses[cardType];
    } else if (cardNumber.match(/^[^\d]+.*/)) {
      response = {};
    }
    console.log(`Binlookup Mock: Card Type: ${cardType}`);
    //console.log(`Binlookup Mock: Response: ${response}`);

    let resolvedPromise = Promise.resolve(response);
    //console.log(`Binlookup Mock: resolvedPromise: `, resolvedPromise);
    return resolvedPromise;
  };
}
