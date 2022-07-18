// contract to be tested
let Mercari90 = artifacts.require("./Mercari90.sol");

// test suite
contract("Mercari90", function(accounts){
  let mercari90Instance;
  let seller = accounts[1];
  let buyer = accounts[2];
  let articleName = "article 1";
  let articleDescription = "Description for article 1";
  let articlePrice = 10;

  // no article for sale yet
  it("should throw an exception if you try to buy an article when there is no article for sale yet", function() {
    return Mercari90.deployed().then(function(instance) {
      mercari90Instance = instance;
      return mercari90Instance.buyArticle(1, {
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
      });
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return mercari90Instance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "number of articles must be 0");
    });
  });

  // buy an article that does not exist
  it("should throw an exception if you try to buy an article that does not exist", function(){
    return Mercari90.deployed().then(function(instance){
      mercari90Instance = instance;
      return mercari90Instance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), { from: seller });
    }).then(function(receipt){
      return mercari90Instance.buyArticle(2, {from: seller, value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() {
      return mercari90Instance.articles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });

  // buying an article you are selling
  it("should throw an exception if you try to buy your own article", function() {
    return Mercari90.deployed().then(function(instance){
      mercari90Instance = instance;

      return mercari90Instance.buyArticle(1, {from: seller, value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return mercari90Instance.articles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });

  // incorrect value
  it("should throw an exception if you try to buy an article for a value different from its price", function() {
    return Mercari90.deployed().then(function(instance){
      mercari90Instance = instance;
      return mercari90Instance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice + 1, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return mercari90Instance.articles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });

  // article has already been sold
  it("should throw an exception if you try to buy an article that has already been sold", function() {
    return Mercari90.deployed().then(function(instance){
      mercari90Instance = instance;
      return mercari90Instance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice, "ether")});
    }).then(function(){
      return mercari90Instance.buyArticle(1, {from: web3.eth.accounts[0], value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return mercari90Instance.articles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], buyer, "buyer must be " + buyer);
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });
});
