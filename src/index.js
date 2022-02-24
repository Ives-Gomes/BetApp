(function(_win, doc) {
  'use strict';

  const app = (function() {
    let apiGamesData;
    let currentGame = [];
    let currentGameName = '';
    let currentTotalPrice = 0;

    return {
      init: function init() {
        app.getAppData();
        app.gameActions();
        app.startCart();
      },

      getAppData: function getAppData() {
        let ajax = new XMLHttpRequest();

        ajax.open('GET', '../utils/data.json', true);
        ajax.send();
        ajax.addEventListener('readystatechange', app.showAppData, false);
      },

      createGameButtons: function createGameButtons() {
        let sectionButtons = doc.querySelector('[data-js="section-buttons"]');

        Array.prototype.map.call(apiGamesData.types, function(game) {
          let gameButton = doc.createElement('button');
          gameButton.setAttribute('data-js', 'game-button');

          gameButton.textContent = game.type;

          gameButton.style.backgroundColor = '#fff';
          gameButton.style.color = game.color;
          gameButton.style.border = `2px solid ${game.color}`

          sectionButtons.appendChild(gameButton);
        });

        app.listenGameButtons();

        if (sectionButtons.childNodes[0]) {
          app.selectButton(sectionButtons.childNodes[0]);
        }
      },

      listenGameButtons: function listenGameButtons() {
        let gameButtons = doc.querySelectorAll('[data-js="game-button"]');

        Array.prototype.map.call(gameButtons, function(button) {
          button.addEventListener('click', function() {
            app.selectButton(button);
          }, false);
        });
      },

      selectButton: function selectButton(button) {
        let gameButtons = doc.querySelector('[data-js="game-buttons"]');

        let othersButtons = [];

        currentGame = [];

        apiGamesData.types.map(function(game) {
          if (button.textContent.trim() === game.type) {
            app.focusGameButton(button, game.color);
            app.showGameInfos(game);

            gameButtons.innerHTML = '';

            for (let i = 0; i < game.range; i++) {
              let buttonGameNumber = doc.createElement('button');

              buttonGameNumber.setAttribute('data-js', 'button-game-number');
              buttonGameNumber.textContent = (i + 1);

              app.gameButtonListener(buttonGameNumber, game);

              gameButtons.appendChild(buttonGameNumber);
            }

            currentGameName = game.type;
          } else {
            othersButtons.push({ 
              gameType: game.type,
              gameColor: game.color
            });
          }
        });

        app.defocusGameButton(othersButtons);
      },

      focusGameButton: function focusGameButton(button, game) {
        button.style.backgroundColor = game;
        button.style.color = '#fff';
        button.style.border = `2px solid ${game}`
      },  

      defocusGameButton: function focusGameButton(othersButtons) {
        let gameButtons = doc.querySelectorAll('[data-js="game-button"]');

        Array.prototype.forEach.call(gameButtons, function(gameButton) {
          othersButtons.map(function(game) {
            if (gameButton.textContent === game.gameType) {
              gameButton.style.backgroundColor = '#fff';
              gameButton.style.color = game.gameColor;
              gameButton.style.border = `2px solid ${game.gameColor}`
            }
          });
        });

      },

      gameButtonListener: function gameButtonListener(button, game) {
        button.addEventListener('click', function() {
          app.game(button, button.textContent, game);
        }, false);
      },

      game: function game(button, gameNumber, game) {
        if (currentGame.length >= game.max_number) {
          return;
        }

        let alreadyExist = currentGame.some(function(n) {
          return n === gameNumber;
        });

        if (alreadyExist) {
          return;
        }

        button.setAttribute('class', 'selected-game');

        currentGame.push(gameNumber);
      },

      gameActions: function gameActions() {
        let completeGame = doc.querySelector('[data-js="complete-game"]');
        let clearGame = doc.querySelector('[data-js="clear-game"]');
        let addToCart = doc.querySelector('[data-js="add-to-cart"]');

        completeGame.addEventListener('click', function() {
          app.completeGame();
        }, false);

        clearGame.addEventListener('click', function() {
          app.clearGame();
        }, false);

        addToCart.addEventListener('click', function() {
          app.createGame();
        }, false);
      },

      createGame: function createGame() {
        Array.prototype.map.call(apiGamesData.types, function(game) {
          if (game.type === currentGameName) {
            if (game.max_number > game.length) {
              return;
            }

            let asideCartItem = doc.createElement('div');
            asideCartItem.setAttribute('class', 'aside-cart-item');

            let button = doc.createElement('button');

            let icon = doc.createElement('span');
            icon.setAttribute('class', 'material-icons');
            icon.textContent = 'delete';

            button.appendChild(icon);
            app.listenDelete(button);

            let divisor = doc.createElement('div'); 
            divisor.setAttribute('class', 'aside-cart-item-divisor');
            divisor.setAttribute('data-js', 'divisor');

            let asideCartItemNumbers = doc.createElement('div');
            asideCartItemNumbers.setAttribute('class', 'aside-cart-item-numbers');

            let gameNumbers = doc.createElement('p');
            gameNumbers.setAttribute('data-js', 'game-numbers');

            asideCartItemNumbers.appendChild(gameNumbers);

            let asideCartItemGame = doc.createElement('div');
            asideCartItemGame.setAttribute('class', 'aside-cart-item-game');
            let name = doc.createElement('p');
            name.setAttribute('data-js', 'game-name');
            let gamePrice = doc.createElement('span');
            gamePrice.setAttribute('data-js', 'game-price');

            asideCartItemGame.appendChild(name);
            asideCartItemGame.appendChild(gamePrice);

            asideCartItemNumbers.appendChild(asideCartItemGame);

            asideCartItem.appendChild(button);
            asideCartItem.appendChild(divisor);
            asideCartItem.appendChild(asideCartItemNumbers);

            app.showInCart(asideCartItem);
            
            return;
          }
        });
      },

      completeGame: function completeGame() {
        app.clearGame();

        Array.prototype.map.call(apiGamesData.types, function(game) {
          if (game.type === currentGameName) {
            app.randomGame(game.max_number, game.range);

            return;
          }
        });
      },

      randomGame: function randomGame(max_number, range) {
        for (let i = 0; i < max_number; i++) {
          let random = Math.floor(Math.random() * (range - 1)) + 1;

          let alreadyExist = currentGame.some(function(number) {
            return number === random;
          });

          if (alreadyExist) {
            i--;

            continue;
          }

          currentGame.push(random);
        }

        app.selectRandomGame();
      },

      selectRandomGame: function selectRandomGame() {
        let gameButtonsDiv = doc.querySelector('[data-js="game-buttons"]');
        let gameButtons = gameButtonsDiv.childNodes;
        
        Array.prototype.map.call(gameButtons, function(button) {
          let buttonNumber = Number(button.textContent);

          let haveThisNumber = currentGame.some(function(number) {
            return number === buttonNumber;
          });

          if (haveThisNumber) {
            button.setAttribute('class', 'selected-game');
          }
        });
      },

      clearGame: function clearGame() {
        if (currentGameName === '') {
          return;
        }

        let gameButtonsDiv = doc.querySelector('[data-js="game-buttons"]');
        let gameButtons = gameButtonsDiv.childNodes;
        
        currentGame = [];

        Array.prototype.map.call(gameButtons, function(button) {
          button.removeAttribute('class');
        });
      }, 

      showInCart: function showInCart(element) {
        let cartTotalPrice = doc.querySelector('[data-js="total-price"]');

        let allGameNumbers = doc.querySelectorAll('[data-js="game-numbers"]');

        app.gameSort();

        let gameAlreadyExistInCart = Array.prototype.some.call(allGameNumbers, function(gameNumber) {
          return gameNumber.textContent === currentGame.join(', ').toString();
        });

        if (gameAlreadyExistInCart || currentGame.length === 0) {
          return;
        }

        let cartItem = doc.querySelector('[data-js="cart-item"]');
        cartItem.appendChild(element);

        let gameNumbers = element.querySelector('[data-js="game-numbers"]');
        let name = element.querySelector('[data-js="game-name"]');
        let gamePrice = element.querySelector('[data-js="game-price"]');
        let divisor = element.querySelector('[data-js="divisor"]');

        gameNumbers.textContent = currentGame.join(', ');
        name.textContent = currentGameName;

        Array.prototype.map.call(apiGamesData.types, function(game) {
          if (currentGameName === game.type) {
            name.style.color = game.color;
            divisor.style.backgroundColor = game.color;

            gamePrice.textContent = app.convertPrice(game.price);
            currentTotalPrice += game.price;
          }
        });

        cartTotalPrice.textContent = app.convertPrice(currentTotalPrice);

        app.clearGame();
      },

      listenDelete: function listenDelete(button) {
        button.addEventListener('click', function() {
          app.deleteItem(button);
        }, false);
      },

      deleteItem: function deleteItem(button) {
        let cartTotalPrice = doc.querySelector('[data-js="total-price"]');

        let cart = button.parentElement.parentElement;
        let item = button.parentElement;
        
        let itemPrice = item.querySelector('[data-js="game-price"]');
        let itemPriceTextContent = itemPrice.textContent;
        let itemPriceString = itemPriceTextContent.slice(2).trim();
        let itemPriceStringFormatted = itemPriceString.replace(/[^\d,]+/g, '').replace(',', '.');
        let itemPriceNumber = Number(itemPriceStringFormatted);
        
        currentTotalPrice -= itemPriceNumber;

        cartTotalPrice.textContent = app.convertPrice(currentTotalPrice);

        cart.removeChild(item);
      },

      showGameInfos: function showGameInfos(game) {
        let name = doc.querySelector('[data-js="game-name"]');
        let gameDescription = doc.querySelector('[data-js="game-description"]');

        name.textContent = game.type.toUpperCase();
        gameDescription.textContent = game.description;
      },

      showAppData: function showAppData() {
        if (!app.isReady.call(this)) {
          return;
        }

        apiGamesData = JSON.parse(this.responseText);

        app.createGameButtons();
      },

      startCart: function startCart() {
        let cartTotalPrice = doc.querySelector('[data-js="total-price"]');

        cartTotalPrice.textContent = app.convertPrice(currentTotalPrice);
      },

      isReady: function isReady() {
        return this.readyState === 4 && this.status === 200;
      },

      gameSort: function gameSort() {
        return currentGame.sort(function(n1, n2) {
          return n1 - n2;
        });
      },

      convertPrice: function convertPrice(price) {
        let formatter = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
        
        return formatter.format(price);
      },
    }
  })();

  app.init();
})(window, document);
