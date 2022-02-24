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

              currentGame.map(function(gameNumber) {
                if (gameNumber === String(i + 1)) {
                  buttonGameNumber.style.backgroundColor = game.color;
  
                  buttonGameNumber.setAttribute('class', 'game-button-selected');
                } else if (gameNumber > game.range) {
                  let index = currentGame.indexOf(gameNumber);

                  currentGame.splice(index, 1);
                }
              });
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
        if (currentGame.length >= game.max_number &&
            button.getAttribute('class') !== 'game-button-selected') {
          alert('A cartela está completa! Adicione ao carrinho ou remova um número.');

          return;
        }

        if (button.getAttribute('class') === 'game-button-selected') {
          button.removeAttribute('class');

          button.removeAttribute('style');

          currentGame.forEach(function(number) {
            if (number === button.textContent) {
              let index = currentGame.indexOf(button.textContent);

              currentGame.splice(index, 1);
            }
          });
          
          return;
        }

        button.style.backgroundColor = game.color;

        button.setAttribute('class', 'game-button-selected');

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
            if (currentGame.length > game.max_number) {
              let singularOrPlural = 's';

              let numbersExceeded = currentGame.length - game.max_number;

              if (numbersExceeded === 1) {
                singularOrPlural = '';
              }

              alert(`Muitos números selecionados! Remova ${numbersExceeded} número${singularOrPlural}.`)
           
              return;
            }

            if (game.max_number > currentGame.length) {
              let singularOrPlural = 's';

              let numbersRemaining = game.max_number - currentGame.length;

              if (numbersRemaining === 1) {
                singularOrPlural = '';
              }

              alert(`Para adicionar ao carrinho escolha mais ${numbersRemaining} número${singularOrPlural}!`);

              return;
            }

            let cartItemVoid = doc.querySelector('[data-js="cart-item-void"]');

            cartItemVoid.textContent = '';

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
        Array.prototype.map.call(apiGamesData.types, function(game) {
          if (currentGame.length === game.max_number) {
            alert('O jogo já está completo! Adicione ao carrinho ou limpe o jogo.')
          }

          if (game.type === currentGameName) {
            if (currentGame.length > game.max_number) {
              let singularOrPlural = 's';
  
              let numbersExceeded = currentGame.length - game.max_number;
  
              if (numbersExceeded === 1) {
                singularOrPlural = '';
              }
  
              alert(`O jogo está com muitos números! Remova ${numbersExceeded} número${singularOrPlural}`);
            }
            
            app.randomGame(game.max_number, game.range, game.color);

            return;
          }
        });
      },

      randomGame: function randomGame(max_number, range, color) {
        let randomNumberLoop = max_number - currentGame.length;

        for (let i = 0; i < randomNumberLoop; i++) {
          let random = Math.floor(Math.random() * (range - 1)) + 1;

          let alreadyExist = currentGame.some(function(number) {
            return number === String(random);
          });

          if (alreadyExist) {
            i--;

            continue;
          }

          currentGame.push(String(random));
        }

        app.selectRandomGame(color);
      },

      selectRandomGame: function selectRandomGame(color) {
        let gameButtonsDiv = doc.querySelector('[data-js="game-buttons"]');
        let gameButtons = gameButtonsDiv.childNodes;
        
        Array.prototype.map.call(gameButtons, function(button) {
          let buttonNumber = button.textContent;

          let haveThisNumber = currentGame.some(function(number) {
            return number === buttonNumber;
          });

          if (haveThisNumber) {
            button.style.backgroundColor = color;

            button.setAttribute('class', 'game-button-selected');
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
          button.removeAttribute('style');

          button.removeAttribute('class');
        });
      }, 

      showInCart: function showInCart(element) {
        let cartTotalPrice = doc.querySelector('[data-js="total-price"]');
        let allGameNumbers = doc.querySelectorAll('[data-js="game-numbers"]');
        let gameButtons = doc.querySelectorAll('[data-js="button-game-number"]');

        app.gameSort();

        let gameAlreadyExistInCart = Array.prototype.some.call(allGameNumbers, function(gameNumber) {
          return gameNumber.textContent === currentGame.join(', ').toString();
        });

        if (gameAlreadyExistInCart) {
          alert('Esse jogo com os mesmos números já existe no carrinho!');

          return;
        }

        Array.prototype.map.call(gameButtons, function(button) {
          button.removeAttribute('class');

          button.removeAttribute('style');
        });

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

        app.checkCartItemsLength(cart);
      },

      checkCartItemsLength: function checkCartItemsLength(cart) {
        if (cart.childNodes.length === 3) {
          app.startCart();
        }
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
        let cartItemVoid = doc.querySelector('[data-js="cart-item-void"]');
        let cartTotalPrice = doc.querySelector('[data-js="total-price"]');

        let cartVoidPhrase = 
          'Seu carrinho está vazio! Escolha um jogo, preencha-o e clique em adicionar ao carrinho.';

        cartItemVoid.textContent = cartVoidPhrase;

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
