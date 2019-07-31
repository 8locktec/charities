import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from './serviceWorker';
import { DrizzleProvider } from "drizzle-react";

// Import contract
import Charities from "./contracts/Charities.json";

console.log(Charities);
console.log(DrizzleProvider);

const options = {
  web3: {
    block: false,
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:8545"
    }
  },
  contracts: [Charities],
  events: {}
};

ReactDOM.render(
  <DrizzleProvider options={options}>
    <App />
  </DrizzleProvider>,
  document.getElementById("root")
);
serviceWorker.unregister();
