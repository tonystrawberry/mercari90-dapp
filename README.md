<p align="center">
  <a href="https://chrome.google.com/webstore/detail/axiedex-the-ultimate-axie/bknllnbfmljmdocaodafmlhcfciicabo">
    <img src="https://cdn.consensys.net/uploads/metamask-1.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Monstarlab<br>
  Backend Knowledge Sharing - 2022年7月<br>
  Mercari90 - 90年代メルカリ
</h1>

## 📚 Resources
Notion (https://dirt-juniper-92e.notion.site/Backend-Knowledge-Sharing-09bbdddb6e7744a69d973ee1268331c7)

## 👨🏻‍🔬 Demo application of a minimalist sell-and-buy application using the Blockchain technology

- 🖥 Include a web client page built with HTML/CSS/Javascript for a basic interface
- 💾 Use <a href="https://web3js.readthedocs.io/en/v1.8.1/#">web3.js</a> libraries to interact with a local ethereum node (run by <a href="https://trufflesuite.com/ganache/" target="_blank">Ganache</a> locally on `http://127.0.0.1:7545`)

## 🚀 Local development

1. Install `truffle` locally 
```javascript
npm install -g truffle
```

2. Compile, reset and deploy smart contracts to the Ethereum network
```
truffle migrate --compile-all --reset --network ganache
```

3. Install Metamask on your browser. In the settings, click on the `Reset account` button to remove all previous transaction data.
4. Install Ganache and run it.
5. Add an account on Metamask using the seed phrase provided by Ganache.
```
bounce airport random uncle tube core horn security number fly section fan
```

6. Run the client application
```
npm install
npm run dev
```

7. Access `http://localhost:3000`. Connect Metamask manually to `http://localhost:3000`.
8. Refresh the page. Now, you should be able to see your balance and sell/buy items from the web page.
