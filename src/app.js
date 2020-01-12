// app.js
/**
 * Author: Jarred Jacobs
 * Email: jarred.jacobs@gmail.com
 * Date: 2020-01-11
 *
 */

import React from "react";
import Binlookup from "binlookup";

import "./styles.css";

const lookup = new Binlookup();

const schemes = ["amex", "discover", "mastercard", "visa"];

const cardLogos = {
  amex: <img src='/amex.svg' className='cardLogo' alt='amex' />,
  discover: <img src='/discover.svg' className='cardLogo' alt='disc' />,
  mastercard: <img src='/mastercard.svg' className='cardLogo' alt='mc' />,
  visa: <img src='/visa.svg' className='cardLogo' alt='visa' />,
  generic: <img src='/generic.svg' className='cardLogo' alt='' />,
};

const Logo = ({cardType}) => {
  return cardLogos[cardType] || null;
};

const Status = ({toastStatus}) => (
  <img
    className='toastStatus'
    src={toastStatus === "Pass" ? "/check.svg" : "/x.svg"}
    alt={toastStatus}
  />
);

const Messages = ({errorMsg}) => <div className='feedbackMsg'>{errorMsg}</div>;

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inputString: props.inputString || "",
      cardNumber: props.cardNumber || "",
    };

    this.spacer = props.spacer || "\\s";

    this.handleInput = this.handleInput.bind(this);
    this.validateInput = this.validateInput.bind(this);
  }

  componentDidMount() {
    if (this.state.inputString) {
      console.debug(
        `componentDidMount: inputString is '${this.state.inputString}'`
      );
      this.lookupCardType();
      this.formatCardNumber();
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.inputString !== this.state.inputString) {
      console.debug(
        `componentDidUpdate: inputString has changed from '${prevState.inputString}' to '${this.state.inputString}'`
      );
      this.formatCardNumber();
      this.lookupCardType();
    }

    if (prevState.cardType !== this.state.cardType) {
      console.debug(
        `componentDidUpdate: cardType has changed from '${prevState.cardType}' to '${this.state.cardType}'`
      );
      this.formatCardNumber();
    }
  }

  unformatCardNumber(cardNumber) {
    let cleanInputString = cardNumber.replace(
      RegExp(`${this.spacer}*`, "g"),
      ""
    ); // Remove all spacer characters from formatting
    return cleanInputString;
  }

  async lookupCardType() {
    const minInputLookupLength = 4;
    const rawInputString = this.state.inputString;
    console.debug(`lookupCardType: Raw inputString: ${rawInputString}`);
    if (rawInputString.length >= minInputLookupLength) {
      if (!this.lookupRunning) {
        console.debug(
          `lookupCardType: New lookup for input "${rawInputString}"`
        );
        this.lookupRunning = true;
        try {
          const response = await lookup(rawInputString);
          this.lookupRunning = false;
          console.debug(`lookupCardType: response: `, response);
          if (response.scheme) {
            if (!schemes.includes(response.scheme)) {
              response.scheme = "generic";
            }
            console.debug(`lookupCardType: cardType is: `, response.scheme);
            this.setState({
              cardType: response.scheme,
              errorMsg: "",
            });
          } else if (Object.entries(response).length === 0) {
            console.debug(`lookupCardType: response is empty: `, response);
            this.setState({
              cardType: "",
              errorMsg: `Oh no! Something went wrong.`,
            });
          }
        } catch (error) {
          this.lookupRunning = false;
          console.debug(`lookupCardType: error: `, error);
          console.error(
            `lookupCardType: Error looking for input '${rawInputString}': `,
            error
          );
          this.setState({
            cardType: "",
            errorMsg: `Oh no! Something went wrong.`,
          });
        }
      } else {
        console.debug(`lookupCardType:  Lookup in progress`);
      }
    } else if (rawInputString.length < minInputLookupLength) {
      // Unset the card type if there is not enough inputText to determine the type
      console.debug(`lookupCardType: Unset cardType and errorMsg`);
      this.setState({cardType: "", errorMsg: ""});
    }
  }

  handleInput(event) {
    const inputString = this.unformatCardNumber(event.target.value);
    console.debug(`handleInput: inputString: ${inputString}`);
    this.setState({
      inputString: inputString,
      cardNumber: inputString, // Set cardNumber to inputString so the user sees what they type without delay
    });
  }

  validateInput(event) {
    const inputString = this.unformatCardNumber(event.target.value);
    console.debug(`validateInput: inputString: `, inputString);

    let cardNumRegEx = new RegExp(
      `(\\d{4})${this.spacer}*(\\d{4})${this.spacer}*(\\d{4})${this.spacer}*(\\d{4})`
    );
    console.debug(`validateInput: cardType: `, this.state.cardType);
    if ("amex" === this.state.cardType) {
      cardNumRegEx = new RegExp(
        `(\\d{4})${this.spacer}*(\\d{6})${this.spacer}*(\\d{5})`
      );
    }
    console.debug(`validateInput: cardNumRegEx: `, cardNumRegEx);

    if (inputString.match(cardNumRegEx)) {
      console.debug(`validateInput: validation Passed: `, inputString);
      this.setState({toastStatus: "Pass"});
      return true;
    } else {
      console.debug(`validateInput: validation Failed: `, inputString);
      this.setState({toastStatus: "Fail"});
      return false;
    }
  }

  formatCardNumber() {
    const rawInputString = this.state.inputString;
    console.debug(`formatCardNumber: rawInputString: `, rawInputString);

    let cardNumRegEx = new RegExp(
      `(\\w{1,4})(\\w{1,4})?(\\w{1,4})?(\\w{1,4})?`
    );

    console.debug(`formatCardNumber: cardType: `, this.state.cardType);
    if ("amex" === this.state.cardType) {
      cardNumRegEx = new RegExp(`(\\w{1,4})(\\w{1,6})?(\\w{1,5})?`);
    }
    console.debug(`formatCardNumber: cardNumRegEx: `, cardNumRegEx);

    let cardNumParts = rawInputString.match(cardNumRegEx);
    //console.debug(`formatCardNumber: cardNumParts: `, cardNumParts);
    if (cardNumParts) {
      let formatedCardNumber = cardNumParts
        .slice(1)
        .filter(Boolean)
        .join(" ");

      if (formatedCardNumber !== this.state.cardNumber) {
        console.debug(
          `formatCardNumber: formatting Card Number '${this.state.cardNumber}' => '${formatedCardNumber}'`
        );
        this.setState({cardNumber: formatedCardNumber});
      } else {
        console.debug(
          `formatCardNumber: Card Number already formatted: '${this.state.cardNumber}' === '${formatedCardNumber}'`
        );
      }
    } else {
      console.debug(
        `formatCardNumber: Formatting RegEx not matched: `,
        cardNumParts
      );
    }
  }

  render() {
    return (
      <div className='App'>
        <div className='cardEntry'>
          <div className='inputBlock'>
            <div className='labelBlock'>
              <label className='cardLabel'>Credit Card Number</label>
              <span className='required'></span>
            </div>
            <input
              className='cardInput'
              type='text'
              name='card-number'
              value={this.state.cardNumber}
              onChange={this.handleInput}
              onBlur={this.validateInput}
              placeholder='1234 1234 1234 1234'
            />
            {this.state.cardType ? <Logo cardType={this.state.cardType} /> : ""}
            {this.state.toastStatus ? (
              <Status toastStatus={this.state.toastStatus} />
            ) : (
              ""
            )}
          </div>
          {this.state.errorMsg ? (
            <Messages errorMsg={this.state.errorMsg} />
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }
}
