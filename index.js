const axios = require("axios").default;
const inquirer = require("inquirer");

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

//main function
const currency_exchange = async () => {
  // rates = dictionary of exchange rates from USD
  // base = USD
  const { rates, base } = await getExchangeRates();
  console.log("Todays current exchange rates in USD");
  console.log(rates);
  console.log(
    "Welcome to the foreign currency exchange app. Exit any time with CTRL+C"
  );
  //if input acronym is not in rates dictionary, keep asking for user input
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
        // amount is string, cast it into a float to see if its greater than or equal to 0 or not NaN
        // or else continue to ask for user input
        validate: async (amount) => {
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
    //returns native,amount,foreign in a dictionary
    const response = await inquirer.prompt(questions);

    //deconstruct the user input and cast the amount into a float
    const { native, foreign } = response;
    const amount = parseFloat(response.amount);

    // the exchange rates from the API are already in USD -> foreign currency so no  need to do any other conversions
    if (native === "USD") {
      const conversionRate = rates[foreign];
      const convertedAmount = (amount * conversionRate).toFixed(2);
      console.log(
        `You converted ${amount} ${native.toUpperCase()} into ${convertedAmount} ${foreign.toUpperCase()}\n`
      );
    }
    // no calculations needed if the user wants to convert to same currency they currently have
    else if (native === foreign) {
      console.log(
        `You converted ${amount} ${native.toUpperCase()} into ${convertedAmount} ${foreign.toUpperCase()}\n`
      );
    } else {
      //convert the native currency to USD, then convert USD to targeted foreign currency
      // only used when native is not USD
      const nativeToUSD = amount / rates[native];
      const conversionRate = rates[foreign];
      const convertedAmount = (nativeToUSD * conversionRate).toFixed(2);
      console.log(
        `You converted ${amount} ${native.toUpperCase()} into ${convertedAmount} ${foreign.toUpperCase()}\n`
      );
    }

    //loop back into user input prompt until the user exits the program
    // so that we don't have to make multiple API requests.
    prompts();
  };

  prompts();
};

currency_exchange();
