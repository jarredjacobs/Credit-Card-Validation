// app.test.js
/**
 * Author: Jarred Jacobs
 * Email: jarred.jacobs@gmail.com
 * Date: 2020-01-11
 *
 */

import React from "react";
import renderer from "react-test-renderer";
import Enzyme, {configure, shallow, mount, render} from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import {isExportDeclaration, isRegularExpressionLiteral} from "typescript";

import App from "./app.js";

Enzyme.configure({adapter: new Adapter()});

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

test("Form renders correctly", () => {
  const tree = renderer.create(<App />).toJSON();
  expect(tree).toMatchInlineSnapshot(`
    <div
      className="App"
    >
      <div
        className="cardEntry"
      >
        <div
          className="inputBlock"
        >
          <div
            className="labelBlock"
          >
            <label
              className="cardLabel"
            >
              Credit Card Number
            </label>
            <span
              className="required"
            />
          </div>
          <input
            className="cardInput"
            name="card-number"
            onBlur={[Function]}
            onChange={[Function]}
            placeholder="1234 1234 1234 1234"
            type="text"
            value=""
          />
          
          
        </div>
        
      </div>
    </div>
  `);
});

describe("App", () => {
  let app = {};

  beforeAll(async () => {
    // Initalize the app asynchronously
    app = await mount(<App inputString='41474' />);

    await app.instance().componentDidMount();
    await app.update();

    // flush promises so that state is updated;
    await flushPromises();

    return app;
  });

  it("Formats the initial input and shows the Logo correctly", () => {
    let cardInput = app.find("input.cardInput");
    console.log(`Format test: cardInput: `, cardInput.debug());
    expect(cardInput.prop("value")).toMatch("4147 4");
    console.log(`Format test: Logo: `, app.find("Logo").debug());

    expect(app.find("Logo img").prop("src")).toMatch("/visa.svg");
  });

  it("Reformats the number when input is added", async () => {
    let cardInput = app.find("input.cardInput");
    cardInput.simulate("change", {target: {value: "41479344"}});

    // flush promises so that state is updated;
    await app.update();
    await flushPromises();

    cardInput = app.find("input.cardInput");
    console.log(`Reformat test: cardInput: `, cardInput.debug());
    console.log(`Reformat test: Logo: `, app.find("Logo").debug());

    expect(cardInput.prop("value")).toMatch("4147 9344");
    expect(app.find("Logo img").prop("src")).toMatch("/visa.svg");
  });

  it("Displays the toast status failure on blur", async () => {
    let cardInput = app.find("input.cardInput");
    cardInput.simulate("change", {target: {value: "41479344"}});
    cardInput.simulate("blur");

    // flush promises so that state is updated;
    await app.update();
    await flushPromises();

    console.log(`Toast Fail test: Status: `, app.find("Status").debug());

    expect(app.find("Status img").prop("src")).toMatch("/x.svg");
  });

  it("Displays the toast status success when number is valid", async () => {
    let cardInput = app.find("input.cardInput");
    cardInput.simulate("change", {target: {value: "4147934423469281"}});
    app.find("input").simulate("blur");

    // flush promises so that state is updated;
    await app.update();
    await flushPromises();

    cardInput = app.find("input.cardInput");
    console.log(`Toast Success test: cardInput: `, cardInput.debug());
    console.log(`Toast Success test: Status: `, app.find("Status").debug());

    expect(cardInput.prop("value")).toMatch("4147 9344 2346 9281");
    expect(app.find("Status img").prop("src")).toMatch("/check.svg");
  });

  it("Handles Amex correctly", async () => {
    let cardInput = app.find("input.cardInput");
    cardInput.simulate("change", {target: {value: "347123456789012"}});

    // flush promises so that state is updated;
    await app.update();
    await flushPromises();

    app.find("input").simulate("blur");

    // flush promises so that state is updated;
    await app.update();
    await flushPromises();

    cardInput = app.find("input.cardInput");
    console.log(`Amex test: cardInput: `, cardInput.debug());
    console.log(`Amex test: Logo: `, app.find("Logo").debug());
    console.log(`Amex test: Status: `, app.find("Status").debug());

    expect(cardInput.prop("value")).toMatch("3471 234567 89012");
    expect(app.find("Logo img").prop("src")).toMatch("/amex.svg");
    expect(app.find("Status img").prop("src")).toMatch("/check.svg");
  });

  it("Shows Error messages correctly", async () => {
    let cardInput = app.find("input.cardInput");
    cardInput.simulate("change", {target: {value: "abc56789012"}});

    // flush promises so that state is updated;
    await app.update();
    await flushPromises();

    app.find("input").simulate("blur");

    // flush promises so that state is updated;
    await app.update();
    await flushPromises();

    cardInput = app.find("input.cardInput");
    console.log(`Error message test: cardInput: `, cardInput.debug());
    console.log(`Error message test: Messages: `, app.find("Messages").debug());

    expect(cardInput.prop("value")).toMatch("abc5 6789 012");
    expect(app.find("Messages").text()).toMatch("Oh no! Something went wrong.");
  });
});
