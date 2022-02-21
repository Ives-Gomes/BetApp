(function(win, doc) {
  'use strict';

  var app = (function() {
    var data;

    return {
      init: function init() {
        app.getAppData();
        app.listenGameButtons();
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

        data.types.map(function(game) {
          if (button.textContent.trim() === game.type || 
              button.textContent.trim() === 'Lotomania') {
            $gameName.textContent = game.type.toUpperCase();
            $gameDescription.textContent = game.description;
          }
        });
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
