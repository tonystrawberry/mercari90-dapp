App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,
  eventsTransactionHashes: [],

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    console.log("initWeb3")
    // initialize web3
    if(typeof web3 !== 'undefined') {
      //reuse the provider of the Web3 object injected by Metamask
      App.web3Provider = web3.currentProvider;
    } else {
      //create a new provider and plug it directly into our local node
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
    }
    web3 = new Web3(App.web3Provider);
    App.displayAccountInfo();

    return App.initContract();
  },

  displayAccountInfo: function() {
    console.log("web3.eth.accounts", web3.eth.accounts)
    console.log("displayAccountInfo")
    web3.eth.getCoinbase(function(err, account) {
      console.log("account", account)
      console.log("err", err)

      if(err === null) {
        App.account = account;
        $('#account').text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if(err === null) {
            $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
          }
        })
      }
    });
  },

  initContract: function() {
    $.getJSON('Mercari90.json', function(mercari90Artifact) {
      // get the contract artifact file and use it to instantiate a truffle contract abstraction
      App.contracts.Mercari90 = TruffleContract(mercari90Artifact);
      // set the provider for our contracts
      App.contracts.Mercari90.setProvider(App.web3Provider);
      // listen to events
      App.listenToEvents();
      // retrieve the article from the contract
      return App.reloadArticles();
    });
  },

  reloadArticles: function() {
    // avoid reentry
    if(App.loading) {
      return;
    }
    App.loading = true;

    // refresh account information because the balance might have changed
    App.displayAccountInfo();

    let mercari90Instance;

    App.contracts.Mercari90.deployed().then(function(instance) {
      mercari90Instance = instance;
      return mercari90Instance.getArticlesForSale();
    }).then(function(articleIds) {
      // retrieve the article placeholder and clear it
      $('#articlesRow').empty();

      for(let i = 0; i < articleIds.length; i++) {
        let articleId = articleIds[i];
        mercari90Instance.articles(articleId.toNumber()).then(function(article){
          App.displayArticle(article[0], article[1], article[3], article[4], article[5]);
        });
      }
      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });
  },

  displayArticle: function(id, seller, name, description, price) {
    let articlesRow = $('#articlesRow');

    let etherPrice = web3.fromWei(price, "ether");

    let articleTemplate = $("#articleTemplate");
    articleTemplate.find('.panel-title').text(name);
    articleTemplate.find('.article-description').text(description);
    articleTemplate.find('.article-price').text(etherPrice + " ETH");
    articleTemplate.find('.btn-buy').attr('data-id', id);
    articleTemplate.find('.btn-buy').attr('data-value', etherPrice);

    // seller
    if (seller == App.account) {
      articleTemplate.find('.article-seller').text("You");
      articleTemplate.find('.btn-buy').hide();
    } else {
      articleTemplate.find('.article-seller').text(seller);
      articleTemplate.find('.btn-buy').show();
    }

    // add this new article
    articlesRow.append(articleTemplate.html());
  },

  sellArticle: function() {
    // retrieve the detail of the article
    let _article_name = $('#article_name').val();
    let _description = $('#article_description').val();
    let _price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");

    if((_article_name.trim() == '') || (_price == 0)) {
      // nothing to sell
      return false;
    }

    App.contracts.Mercari90.deployed().then(function(instance) {
      console.log("sellArticle")
      return instance.sellArticle(_article_name, _description, _price, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },

  // listen to events triggered by the contract
  listenToEvents: function() {
    App.contracts.Mercari90.deployed().then(function(instance) {
      instance.LogSellArticle({}, {}).watch(function(error, event) {
        if (App.eventsTransactionHashes.includes(event.transactionHash)){
          return
        }
        App.eventsTransactionHashes.push(event.transactionHash)
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._name + ' is now for sale</li>');
        } else {
          console.error(error);
        }
        App.reloadArticles();
      });

      instance.LogBuyArticle({}, {}).watch(function(error, event) {
        if (App.eventsTransactionHashes.includes(event.transactionHash)){
          return
        }
        App.eventsTransactionHashes.push(event.transactionHash)
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._buyer + ' bought ' + event.args._name + '</li>');
        } else {
          console.error(error);
        }
        App.reloadArticles();
      });
    });
  },

  buyArticle: function() {
    event.preventDefault();

    // retrieve the article
    let _articleId = $(event.target).data('id');
    let _price = parseFloat($(event.target).data('value'));

    App.contracts.Mercari90.deployed().then(function(instance){
      return instance.buyArticle(_articleId, {
        from: App.account,
        value: web3.toWei(_price, "ether"),
        gas: 500000
      });
    }).catch(function(error) {
      console.error(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
