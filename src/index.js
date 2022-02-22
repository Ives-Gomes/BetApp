(function(win, doc) {
  'use strict';

  var app = (function() {
    var data;
    var $game = [];
    var $gameName = '';
    var $totalPrice = 0;

    return {
      init: function init() {
        app.getAppData();
        app.listenGameButtons();
        app.gameActions();
        app.startCart();
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

      selectButton: function selectButton(button) {
        var $name = doc.querySelector('[data-js="game-name"]');
        var $gameDescription = doc.querySelector('[data-js="game-description"]');
        var $gameButtons = doc.querySelector('[data-js="game-buttons"]');

        $game = [];

        data.types.map(function(game) {
          if (button.textContent.trim() === game.type) {
            $name.textContent = game.type.toUpperCase();
            $gameDescription.textContent = game.description;

            $gameButtons.innerHTML = '';

            for (var i = 0; i < game.range; i++) {
              var $buttonGameNumber = doc.createElement('button');
              $buttonGameNumber.setAttribute('data-js', 'button-game-number');
              $buttonGameNumber.textContent = (i + 1);

              app.gameButtonListener($buttonGameNumber, game);

              $gameButtons.appendChild($buttonGameNumber);
            }

            $gameName = game.type;
          }
        });
      },

      gameButtonListener: function gameButtonListener(button, game) {
        button.addEventListener('click', function() {
          app.game(button, button.textContent, game);
        }, false);
      },

      game: function game(button, gameNumber, game) {
        if ($game.length >= game.max_number) {
          return;
        }

        var $alreadyExist = $game.some(function(n) {
          return n === gameNumber;
        });

        if ($alreadyExist) {
          return;
        }

        button.setAttribute('class', 'selected-game');

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
        Array.prototype.map.call(data.types, function(game) {
          if (game.type === $gameName) {
            if (game.max_number > $game.length) {
              return;
            }

            var $asideCartItem = doc.createElement('div');
            $asideCartItem.setAttribute('class', 'aside-cart-item');

            var $button = doc.createElement('button');

            var $icon = doc.createElement('span');
            $icon.setAttribute('class', 'material-icons');
            $icon.textContent = 'delete';

            $button.appendChild($icon);

            var $divisor = doc.createElement('div'); 
            $divisor.setAttribute('class', 'aside-cart-item-divisor');
            $divisor.setAttribute('data-js', 'divisor');

            var $asideCartItemNumbers = doc.createElement('div');
            $asideCartItemNumbers.setAttribute('class', 'aside-cart-item-numbers');

            var $gameNumbers = doc.createElement('p');
            $gameNumbers.setAttribute('data-js', 'game-numbers');

            $asideCartItemNumbers.appendChild($gameNumbers);

            var $asideCartItemGame = doc.createElement('div');
            $asideCartItemGame.setAttribute('class', 'aside-cart-item-game');
            var $name = doc.createElement('p');
            $name.setAttribute('data-js', 'game-name');
            var $gamePrice = doc.createElement('span');
            $gamePrice.setAttribute('data-js', 'game-price');

            $asideCartItemGame.appendChild($name);
            $asideCartItemGame.appendChild($gamePrice);

            $asideCartItemNumbers.appendChild($asideCartItemGame);

            $asideCartItem.appendChild($button);
            $asideCartItem.appendChild($divisor);
            $asideCartItem.appendChild($asideCartItemNumbers);

            app.showInCart($asideCartItem);
            
            return;
          }
        });
      },

      showInCart: function showInCart(element) {
        var $cartItem = doc.querySelector('[data-js="cart-item"]');
        $cartItem.appendChild(element);

        var $cartTotalPrice = doc.querySelector('[data-js="total-price"]');

        var $gameNumbers = element.querySelector('[data-js="game-numbers"]');
        var $name = element.querySelector('[data-js="game-name"]');
        var $gamePrice = element.querySelector('[data-js="game-price"]');
        var $divisor = element.querySelector('[data-js="divisor"]');

        $gameNumbers.textContent = $game.join(', ');
        $name.textContent = $gameName;

        Array.prototype.map.call(data.types, function(game) {
          if ($gameName === game.type) {
            $name.style.color = game.color;
            $divisor.style.backgroundColor = game.color;

            $gamePrice.textContent = app.convertPrice(game.price);
            $totalPrice += game.price;
          }
        });

        $cartTotalPrice.textContent = app.convertPrice($totalPrice);
      },

      showAppData: function showAppData() {
        if (!app.isReady.call(this)) {
          return;
        }

        data = JSON.parse(this.responseText);
      },

      startCart: function startCart() {
        var $cartTotalPrice = doc.querySelector('[data-js="total-price"]');

        $cartTotalPrice.textContent = app.convertPrice($totalPrice);
      },

      isReady: function isReady() {
        return this.readyState === 4 && this.status === 200;
      },

      convertPrice: function convertPrice(price) {
        var formatter = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
        
        return formatter.format(price);
      },
    }
  })();

  app.init();
})(window, document);
