const dataStorage = {
  _data: {},
 
  setItem: function(id, val) {
    return (this._data[id] = val);
  },

  getItem: function(id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function(id) {
    return delete this._data[id]; 
  },

  clear: function() {
    return (this._data = {});
  }
};

function StorageManager() {
  this.bestScoreKey = "bestScore";
  this.gameStateKey = "gameState";
  this.leaderboardKey = "leaderboard";
  this.usernameKey = "username";

  this.storage = dataStorage;
}

// Best score getters/setters
StorageManager.prototype.getBestScore = function() {
  const leaderboard = this.getLeaderboard();
  return leaderboard && leaderboard[0] ? leaderboard[0].score : 0;
};

StorageManager.prototype.setBestScore = function(score, changeLocaldb = true) {
  if (changeLocaldb) W.changeLocaldb(score);
  this.storage.setItem(this.bestScoreKey, score);
};

// leaderboard getters/setters
StorageManager.prototype.getLeaderboard = function() {
  return this.storage.getItem(this.leaderboardKey) || [];
};

StorageManager.prototype.setLeaderboard = function(leaderboard) {
  this.storage.setItem(this.leaderboardKey, leaderboard);
};

// Game state getters/setters and clearing
StorageManager.prototype.getGameState = function() {
  var stateJSON = this.storage.getItem(this.gameStateKey);
  return stateJSON ? JSON.parse(stateJSON) : null;
};

StorageManager.prototype.setGameState = function(gameState) {
  this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
};

StorageManager.prototype.clearGameState = function() {
  this.storage.removeItem(this.gameStateKey);
};

// username getter/setter
StorageManager.prototype.getUsername = function() {
  return this.storage.getItem(this.usernameKey) || "";
};

StorageManager.prototype.setUsername = function(username) {
  this.storage.setItem(this.usernameKey, username);
};

// add score to leaderboard
StorageManager.prototype.addToLeaderboard = function(score) {
  const dispatch = qlite => W.share.dispatch([], qlite, []);
  const name = this.getUsername();

  dispatch([
    "__compose",
    [
      [
        "__unless",
        [["__compose", [["__gte", [10]], ["__length"]]], ["__dropLast", [1]]]
      ],
      ["__reverse"],
      ["__sortBy", [["__prop", ["score"]]]],
      // if name exist and lesser than score
      [
        "__reject",
        [
          [
            "__both",
            [
              ["__compose", [["__equals", [name]], ["__prop", ["name"]]]],
              ["__compose", [["__gt", [score]], ["__prop", ["score"]]]]
            ]
          ]
        ]
      ],
      // if name exist and greater than score
      [
        "__unless",
        [
          [
            "__compose",
            [
              ["__not"],
              [
                "__find",
                [
                  [
                    "__both",
                    [
                      [
                        "__compose",
                        [["__equals", [name]], ["__prop", ["name"]]]
                      ],
                      ["__compose", [["__gt", [score]], ["__prop", ["score"]]]]
                    ]
                  ]
                ]
              ]
            ]
          ],
          ["__append", [{ name, score }]]
        ]
      ],
      // if name not exist
      [
        "__unless",
        [
          [
            "__find",
            [["__compose", [["__equals", [name]], ["__prop", ["name"]]]]]
          ],
          ["__append", [{ name, score }]]
        ]
      ]
    ]
  ]);
};
