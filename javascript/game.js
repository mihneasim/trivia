exports = typeof window !== "undefined" && window !== null ? window : global;

exports.Category = function(name, whenToPick) {
  var questions = [];
  this.name = name;
  this.whenToPick = whenToPick;

  this.addQuestion = function addQuestion (question) {
    questions.push(question);
  }

  this.consumeQuestion = function consumeQuestion () {
    return questions.shift();
  }

  this.isPicked = function (pickIndex) {
    return this.whenToPick.indexOf(pickIndex) !== -1;
  }
}

exports.Game = function() {
  var players          = new Array();
  var places           = new Array(6);
  var purses           = new Array(6);
  var inPenaltyBox     = new Array(6);

  var popQuestions     = new Array();
  var scienceQuestions = new Array();
  var sportsQuestions  = new Array();
  var rockQuestions    = new Array();

  var currentPlayer    = 0;
  var isGettingOutOfPenaltyBox = false;

  var didPlayerWin = function(){
    return !(purses[currentPlayer] == 6)
  };
  var categories = [
    new Category('Pop', [0, 4, 8]),
    new Category('Science', [1, 5, 9]),
    new Category('Sports', [2, 6, 10]),
    new Category('Rock', [])];

  var defaultCategory = categories[categories.length - 1];

  var currentCategory = function(){
    for (var ind=0; ind < categories.length; ind++) {
      if (categories[ind].isPicked(places[currentPlayer]))
	  return categories[ind];
    }
    return defaultCategory;
  };

  this.createRockQuestion = function(index){
    return "Rock Question "+index;
  };

  for(var i = 0; i < 50; i++){
    for (var ind=0; ind < categories.length; ind++) {
	if (categories[ind].name !== 'Rock')
	  categories[ind].addQuestion(categories[ind].name + " Question " + i);
	else
	  categories[ind].addQuestion(this.createRockQuestion(i));
    }
  };

  this.isPlayable = function() {
    return this.howManyPlayers() >= 2;
  };

  this.add = function(playerName){
    var noPlayers;
    players.push(playerName);
    noPlayers = this.howManyPlayers();
    places[noPlayers - 1] = purses[noPlayers - 1] = 0;
    inPenaltyBox[noPlayers - 1] = false;

    console.log(playerName + " was added");
    console.log("They are player number " + noPlayers);

    return true;
  };

  this.howManyPlayers = function(){
    return players.length;
  };


  var askQuestion = function(){
    console.log(currentCategory().consumeQuestion());
  };

  this.roll = function(roll){
    console.log(players[currentPlayer] + " is the current player");
    console.log("They have rolled a " + roll);

    if(inPenaltyBox[currentPlayer]){
      if(roll % 2 != 0){
        isGettingOutOfPenaltyBox = true;

        console.log(players[currentPlayer] + " is getting out of the penalty box");
        places[currentPlayer] = places[currentPlayer] + roll;
        if(places[currentPlayer] > 11){
          places[currentPlayer] = places[currentPlayer] - 12;
        }

        console.log(players[currentPlayer] + "'s new location is " + places[currentPlayer]);
        console.log("The category is " + currentCategory().name);
        askQuestion();
      }else{
        console.log(players[currentPlayer] + " is not getting out of the penalty box");
        isGettingOutOfPenaltyBox = false;
      }
    }else{

      places[currentPlayer] = places[currentPlayer] + roll;
      if(places[currentPlayer] > 11){
        places[currentPlayer] = places[currentPlayer] - 12;
      }

      console.log(players[currentPlayer] + "'s new location is " + places[currentPlayer]);
      console.log("The category is " + currentCategory().name);
      askQuestion();
    }
  };

  var nextPlayerTurn = function() {
        currentPlayer += 1;
        if(currentPlayer == players.length)
          currentPlayer = 0;
  };

  var answerWasCorrect = function () {
      console.log("Answer was correct!!!!");
      purses[currentPlayer] += 1;
      console.log(players[currentPlayer] + " now has " +
                  purses[currentPlayer]  + " Gold Coins.");
  };

  this.wasCorrectlyAnswered = function(){
    var winner;

    if(inPenaltyBox[currentPlayer]){
      if(isGettingOutOfPenaltyBox){

	answerWasCorrect();
        winner = didPlayerWin();
	nextPlayerTurn();

        return winner;
      }else{

	nextPlayerTurn();
        return true;
      }

    }else{

      answerWasCorrect();
      winner = didPlayerWin();
      nextPlayerTurn();

      return winner;
    }
  };

  this.wrongAnswer = function(){
		console.log('Question was incorrectly answered');
		console.log(players[currentPlayer] + " was sent to the penalty box");
		inPenaltyBox[currentPlayer] = true;

		nextPlayerTurn();
		return true;
  };
};

var notAWinner = false;

var game = new Game();

game.add('Chet');
game.add('Pat');
game.add('Sue');

do{

  game.roll(Math.floor(Math.random()*6) + 1);

  if(Math.floor(Math.random()*10) == 7){
    notAWinner = game.wrongAnswer();
  }else{
    notAWinner = game.wasCorrectlyAnswered();
  }

}while(notAWinner);
