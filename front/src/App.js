import React, { Component } from "react";
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';


import "./App.css";

import { drizzleConnect } from "drizzle-react";
import { AccountData, ContractData, ContractForm } from "drizzle-react-components";


class App extends Component {


  render() {
    const { drizzleStatus, accounts } = this.props;


    if (drizzleStatus.initialized) {

      return (
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">Total charities:
            <ContractData
              contract="Charities"
              method="idGenerator"
            />
            </h1>
            <div>Myaddress - don't forget to add private key with metamask(accounts[0]): <AccountData
              accountIndex={0}
              units="ether"
              render={({ address, balance, units }) => (
               <div>
                 <div>Contract owner address: <span style={{ color: "#f50057" }}>{address}</span></div>
                 <div>Balance: <span style={{ color: "#f50057" }}>{balance}</span> {units}</div>
               </div>
             )}
            /></div>

          </header>
          <ContractForm
          contract="Charities"
          method="addCharity"
          labels={["Title", "Patron","TotalDonations", "Price (wei)", "ServiceProvider", "EndBlock"]}
          render={({ inputs, inputTypes, state, handleInputChange, handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                {inputs.map((input, index) => (
                  <TextField

                    key={input.name}
                    type={inputTypes[index]}
                    name={input.name}
                    value={state[input.name]}
                    placeholder={input.name}
                    onChange={handleInputChange}
                  />
                ))}
                <Button
                  size="large" color="secondary"
                  key="submit"
                  type="button"
                  onClick={handleSubmit}

                >
                  Add a charity
                </Button>
              </form>
            )}

          />
          <Divider />
           <ContractForm
            contract="Charities"
            method="donateToCharity"
            labels={["Id", "Nr.Of."]}
            sendArgs={{gas: 250000, gasPrice: 20000000000, value: 50000000000 }}
            render={({ inputs, inputTypes, state, handleInputChange, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                  {inputs.map((input, index) => (
                    <Input

                      key={input.name}
                      type={inputTypes[index]}
                      name={input.name}
                      value={state[input.name]}
                      placeholder={input.name}
                      onChange={handleInputChange}
                    />
                  ))}
                  <Button
                    size="large" color="secondary"
                    key="submit"
                    type="button"
                    onClick={handleSubmit}
                  >
                    Donate to charity
                  </Button>
                </form>
              )}

          />

          <Divider />
          <ContractForm
            contract="Charities"
            method="consumeDonation"
            labels={["Id"]}
            render={({ inputs, inputTypes, state, handleInputChange, handleSubmit, label }) => (
                <form onSubmit={handleSubmit}>
                  {inputs.map((input, index) => (
                    <Input

                      key={input.name}
                      type={inputTypes[index]}
                      name={input.name}
                      value={state[input.name]}
                      placeholder={input.name}
                      onChange={handleInputChange}
                    />
                  ))}
                  <Button
                    size="large" color="secondary"
                    key="submit"
                    type="button"
                    onClick={handleSubmit}

                  >
                    Confirm consumation
                  </Button>
                </form>
              )}

          />
          <Divider />

          <ContractForm
            contract="Charities"
            method="closeCharity"
            labels={["Id"]}
            render={({ inputs, inputTypes, state, handleInputChange, handleSubmit, label }) => (
                <form onSubmit={handleSubmit}>
                  {inputs.map((input, index) => (
                    <Input
                      label="Close charity: (as owner)"
                      key={input.name}
                      type={inputTypes[index]}
                      name={input.name}
                      value={state[input.name]}
                      placeholder={input.name}
                      onChange={handleInputChange}
                    />
                  ))}
                  <Button
                    size="large" color="secondary"
                    key="submit"
                    type="button"
                    onClick={handleSubmit}

                  >
                    Close Charity
                  </Button>
                </form>
              )}

          />

          <Card style={{ backgroundColor: "lightgray" }}>
              <CardContent>
              <Typography gutterBottom variant="headline" component="h2">
                  CHARITY 1
              </Typography>
              <Typography component="div">
              <ContractData
                drizzleState={drizzleStatus}
                contract="Charities"
                method="readCharity"
                methodArgs={["0"]}
              /></Typography>
              </CardContent>
              <CardActions>
              </CardActions>
          </Card>
          <Divider />

          <Card style={{ backgroundColor: "lightgray" }}>
              <CardContent>
              <Typography gutterBottom variant="headline" component="h2">
                  CHARITY 2
              </Typography>
              <Typography component="div">
              <ContractData
                drizzleState={drizzleStatus}
                contract="Charities"
                method="readCharity"
                methodArgs={["1"]}
              /></Typography>
              </CardContent>
              <CardActions>
              </CardActions>
          </Card>
          <Divider />

          <Card style={{ backgroundColor: "lightgray" }}>
              <CardContent>
              <Typography gutterBottom variant="headline" component="h2">
                  CHARITY 3
              </Typography>
              <Typography component="div">
              <ContractData
                drizzleState={drizzleStatus}
                contract="Charities"
                method="readCharity"
                methodArgs={["2"]}
              /></Typography>
              </CardContent>
              <CardActions>
              </CardActions>
          </Card>
          <Divider />

          <Card style={{ backgroundColor: "lightgray" }}>
              <CardContent>
              <Typography gutterBottom variant="headline" component="h2">
                  CHARITY 4
              </Typography>
              <Typography component="div">
              <ContractData
                drizzleState={drizzleStatus}
                contract="Charities"
                method="readCharity"
                methodArgs={["3"]}
              /></Typography>
              </CardContent>
              <CardActions>
              </CardActions>
          </Card>
          <Divider />

       </div>
      );
    }

    return <div>Loading dapp...</div>;
  }
}

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    drizzleStatus: state.drizzleStatus,
    Charities: state.contracts.Charities
  };
};

const AppContainer = drizzleConnect(App, mapStateToProps);
export default AppContainer;
