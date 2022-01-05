import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import HelloWorld from "./contracts/HelloWorld.json";
import getWeb3 from "./getWeb3";
import "./App.css";


class App extends Component {
  state = { storageValue: 0, web3: null, accounts: [], balance: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      const { utils } = require('ethers');
      var balance = await web3.eth.getBalance(accounts[0]); //Will give value in.
      balance = utils.formatEther(balance);
      balance = (+balance).toFixed(2);

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      let deployedNetwork = SimpleStorageContract.networks[networkId];
      const storageInstance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      deployedNetwork = HelloWorld.networks[networkId];
      const helloWorldInstance = new web3.eth.Contract(
        HelloWorld.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, balance: parseFloat(balance).toFixed(2), storageContract: storageInstance, helloWorldContract: helloWorldInstance, }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, storageContract, helloWorldContract } = this.state;

    // Stores a given value, 5 by default.
    await storageContract.methods.set(accounts.length).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const storageResponse = await storageContract.methods.get().call();
    console.log('storageContract', storageContract)
    const greetingResponse = await helloWorldContract.methods.getGreeting().call();

    // Update state with the result.
    this.setState({ storageValue: storageResponse, greeting: greetingResponse });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h2>Smart Contract Example</h2>
        {
          this.state.accounts && this.state.accounts.map((account) => {
            return (
              <div key={account}>
                The addrress is : {account}
              </div>
            )
          })
        }
        <div>
          Balance is : {this.state.balance ? this.state.balance + 'ETH' : '-'}
        </div>
      </div>
    );
  }
}

export default App;