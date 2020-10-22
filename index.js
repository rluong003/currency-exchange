const axios = require("axios").default;
const inquirer = require("inquirer");
const chalk = require("chalk");

//make the api request with exchange rates in USD
const getExchangeRates = async () => {
  try {
    const URL = `https://api.exchangeratesapi.io/latest?base=USD`;
    const response = await axios.get(URL);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Converts a native currency into a foreign currency
 *
 * Step 1: Make API request and get the exchange rates in USD
 * Step 2: Prompt for user input with inquirer to get Native currency, total amount, and foreign currency
 * Step 2.5: Validate each user input
 * Step 3: Make the necessary conversion. 4 cases
 *        Case 1: if the native currency and the foreign currency are the same, no calculation is needed
 *        Case 2: Convert a native currency into USD. We find the exchange rate from USD to native and do (amount / native exchange rate)
 *        Case 3: Native currency is USD. Since our exchange rates already in USD, we simply multiply amount by the foreign currency exchange rate
 *        Case 4: Native currency is not USD and Foreign is not USD. We convert native to USD, then convert the USD amount to the foreign amount
 * Step 4: Loop back into user prompt, so that we only have to make 1 API request until the user exits the program with CTRL+C
 */

const currency_exchange = async () => {
  const { rates, base } = await getExchangeRates();
  console.log("Todays current exchange rates in USD");
  console.log(rates);
  console.log(
    chalk.magenta(
      "Welcome to the foreign currency exchange app. Exit any time with CTRL+C \n"
    )
  );

  const validateAcronym = async (acronym) => {
    if (!(acronym.toUpperCase() in rates)) {
      return "Please input a valid currency acronym";
    }
    return true;
  };

  const prompts = async () => {
    const questions = [
      {
        type: "input",
        name: "native",
        message:
          "Please enter the three letter currency acronym of your native currency: ",
        validate: validateAcronym,
      },
      {
        type: "input",
        name: "amount",
        message: "Please enter the amount of your native currency: ",

        validate: async (amount) => {
          let regEX = amount.match(/[+-]?((?=\.?\d)\d*\.?\d*)/);
          if (!regEX) {
            return "Please enter a valid number";
          }
          let valid = !isNaN(parseFloat(amount)) && parseFloat(amount) >= 0;
          return valid || "Please enter a valid number";
        },
      },
      {
        type: "input",
        name: "foreign",
        message:
          "Please enter the three letter currency acronym of the foreign currency you want to convert to: ",
        validate: validateAcronym,
      },
    ];

    const response = await inquirer.prompt(questions);

    let { native, foreign } = response;
    const amount = parseFloat(response.amount);

    native = native.toUpperCase();
    foreign = foreign.toUpperCase();
    if (native === foreign) {
      console.log(
        "You converted " +
          chalk.green(`${amount} ${native}`) +
          " into " +
          chalk.yellow(`${amount} ${foreign}\n`)
      );
    } 
    else if (native === "USD") {
      const conversionRate = rates[foreign];
      const convertedAmount = (amount * conversionRate);
      console.log(
        "You converted " +
          chalk.green(`${amount} ${native}`) +
          " into " +
          chalk.yellow(`${convertedAmount} ${foreign}\n`)
      );
    } 
    else if (foreign === "USD") {
      const convertedAmount = (amount / rates[native]);
      console.log(
        "You converted " +
          chalk.green(`${amount} ${native}`) +
          " into " +
          chalk.yellow(`${convertedAmount} ${foreign}\n`)
      );
    } 
    else {
      const nativeToUSD = amount / rates[native];
      const conversionRate = rates[foreign];
      const convertedAmount = (nativeToUSD * conversionRate);
      console.log(
        "You converted " +
          chalk.green(`${amount} ${native}`) +
          " into " +
          chalk.yellow(`${convertedAmount} ${foreign}\n`)
      );
    }

    prompts();
  };

  prompts();
};

currency_exchange();
