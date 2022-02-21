(function(win, doc) {
  'use strict';

  var app = (function() {
    var data;
    var $game = [];

    return {
      init: function init() {
        app.getAppData();
        app.listenGameButtons();
        app.gameActions();
      },

      getAppData: function getAppData() {
        var ajax = new XMLHttpRequest();

        ajax.open('GET', '../utils/data.json', true);
        ajax.send();
        ajax.addEventListener('readystatechange', app.showAppData, false);
      },

      listenGameButtons: function listenGameButtons() {
        var $gameButtons = doc.querySelectorAll('[data-js="game-button"]');

        Array.prototype.map.call($gameButtons, function(button) {
          button.addEventListener('click', function() {
            app.selectButton(button, $gameButtons);
          }, false);
        });
      },

      selectButton: function selectButton(button, buttons) {
        var $gameName = doc.querySelector('[data-js="game-name"]');
        var $gameDescription = doc.querySelector('[data-js="game-description"]');
        var $gameButtons = doc.querySelector('[data-js="game-buttons"]');

        data.types.map(function(game) {
          if (button.textContent.trim() === game.type) {
            $gameName.textContent = game.type.toUpperCase();
            $gameDescription.textContent = game.description;

            $gameButtons.innerHTML = '';

            for (var i = 0; i < game.range; i++) {
              var $buttonGameNumber = doc.createElement('button');
              $buttonGameNumber.setAttribute('data-js', 'button-game-number');
              $buttonGameNumber.textContent = (i + 1);

              app.gameButtonListener($buttonGameNumber, game);

              $gameButtons.appendChild($buttonGameNumber);
            }
          }
        });
      },

      gameButtonListener: function gameButtonListener(button, game) {
        button.addEventListener('click', function() {
          app.game(button.textContent, game);
        }, false);
      },

      game: function game(gameNumber, game) {
        if ($game.length >= game.max_number) {
          return;
        }

        var $alreadyExist = $game.some(function(n) {
          return n === gameNumber;
        });

        if ($alreadyExist) {
          return;
        }

        $game.push(gameNumber);
      },

      gameActions: function gameActions() {
        var $completeGame = doc.querySelector('[data-js="complete-game"]');
        var $clearGame = doc.querySelector('[data-js="clear-game"]');
        var $addToCart = doc.querySelector('[data-js="add-to-cart"]');

        $addToCart.addEventListener('click', function() {
          app.createGame();
        }, false);
      },

      createGame: function createGame() {
        var $asideCartItem = doc.createElement('div');
        $asideCartItem.setAttribute('class', 'aside-cart-item');

        var $button = doc.createElement('button');

        var $icon = doc.createElement('span');
        $icon.setAttribute('class', 'material-icons');
        $icon.textContent = 'delete';

        $button.appendChild($icon);

        var $divisor = doc.createElement('div'); 
        $divisor.setAttribute('class', 'aside-cart-item-divisor');

        var $asideCartItemNumbers = doc.createElement('div');
        $asideCartItemNumbers.setAttribute('class', 'aside-cart-item-numbers');

        var $gameNumbers = doc.createElement('p');
        $gameNumbers.setAttribute('data-js', 'game-numbers');

        $asideCartItemNumbers.appendChild($gameNumbers);

        var $asideCartItemGame = doc.createElement('div');
        $asideCartItemGame.setAttribute('class', 'aside-cart-item-game');
        var $gameName = doc.createElement('p');
        $gameName.setAttribute('data-js', 'game-name');
        var $gamePrice = doc.createElement('span');
        $gamePrice.setAttribute('data-js', 'game-price');

        $asideCartItemGame.appendChild($gameName);
        $asideCartItemGame.appendChild($gamePrice);

        $asideCartItemNumbers.appendChild($asideCartItemGame);

        $asideCartItem.appendChild($button);
        $asideCartItem.appendChild($divisor);
        $asideCartItem.appendChild($asideCartItemNumbers);

        app.showInCart($asideCartItem);
      },

      showInCart: function showInCart(element) {
        var $cartItem = doc.querySelector('[data-js="cart-item"]');
        $cartItem.appendChild(element);

        var $gameNumbers = doc.querySelector('[data-js="game-numbers"]');
        var $gameName = doc.querySelector('[data-js="game-name"]');
        var $gamePrice = doc.querySelector('[data-js="game-price"]');

        // $gameNumbers.textContent = $game.join(', ');

        // $gameName.textContent = 'Lotofácil';
        // $gamePrice.textContent = 'R$ 2,50';
      },

      showAppData: function showAppData() {
        if (!app.isReady.call(this)) {
          return;
        }

        data = JSON.parse(this.responseText);
      },

      isReady: function isReady() {
        return this.readyState === 4 && this.status === 200;
      },
    }
  })();

  app.init();
})(window, document);
