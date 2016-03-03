/**
 * Log a message to the message board
 * @param {string} message Message to add to the message board
 * @param {string} cssClass CSS class for the message
 */
var log = function (message, cssClass) {
    var cssClass = (typeof cssClass === 'undefined') ? '' : cssClass;
    $('#messageBoard').append('<p class="messageItem ' + cssClass + '" >' + message + '</p>');

    $('#messageBoard').scroll();

    $('#messageBoard').animate({
        scrollTop: $('#messageBoard').scrollTop() - $('#messageBoard').offset().top + $('p:last').offset().top
    }, 500);
};

/**
 * Displays user funds
 * @param {Player} player Player object
 */
var displayFunds = function (player) {
    var cssClass = player.cssClass;

    $('#player' + player.id).html('<p class=' + cssClass + '>£' + player.funds + '</p>');
    $('#player' + player.id).addClass('highlight');

    var highlight = setInterval(function () {
        $('#player' + player.id).removeClass('highlight');
        clearInterval(highlight);
    }, 1000);
};

/**
 * Player object. Can either be a computer or a person
 * @param {array} playerConfig Collection of config values
 * @returns {Player}
 */
function Player(playerConfig) {
    this.id = playerConfig.id;
    this.name = playerConfig.name;
    this.funds = playerConfig.funds;
    this.isComputer = playerConfig.isComputer;
    this.cssClass = playerConfig.cssClass;
    this.boughtItems = [];
    this.inJail = false;
    this.doubleRollCounter = 0;
    this.currentPosition = 0;


}

/**
 * Street object
 * @param {array} config Street config
 * @returns {Street}
 */
function Street(config) {
    this.name = config.name;
    this.value = config.value;
    this.ownerID = null;
    this.totalHouses = 0;
    this.maxHouses = 4;
    this.houseCost = 50;

    /**
     * Ask the player a question
     * @param {Player} player Player to ask
     * @param {string} message Question to ask
     * @returns {Street.askQuestion.answer|Boolean}
     */
    this.askQuestion = function (player, message) {
        if (player.isComputer) {
            var computerChoice = Math.floor(Math.random() * (100 - 50 + 1)) + 1;
            var computerSaysYes = (computerChoice % 2) ? true : false;

            if (computerSaysYes) {
                log(player.name + ' has said yes!', 'warning');
                return true;
            } else {
                log(player.name + ' has said no!', 'warning');
                return false;

            }
        }
        var answer = confirm(message);
        return answer;
    };

    /**
     * Performs a street action
     * @param {Player} player Player on the street
     * @param {array} players Array of players
     */
    this.performAction = function (player, players) {

        console.log('Perfoming action street on ' + this.name);

        if (this.ownerID !== null) {
            if (this.ownerID === player.id) {
                // Player already owns street
                if (this.totalHouses < this.maxHouses) {
                    var message = player.name + ' would you like to add a house to ' + this.name + ' for £' + this.houseCost + '?';
                    log(message, 'warning');
                    var buyHouse = this.askQuestion(player, message);
                    if (buyHouse) {
                        this.addHouse(player, players);
                    }
                }
            } else {

                // Someone else already owns this street and the player is charged rent
                var fee = (this.value * this.totalHouses) > 0 ? this.value * this.totalHouses : this.value;
                var owner = players[this.ownerID - 1];
                var message = player.name + ' YOU OWE £' + fee + ' in rent to  ' + owner.name + ' for ' + this.name + '!';
                log(message, 'warning');
                this.payRent(player, players);

            }
        } else {
            // No one owns the street
            if (player.funds >= this.value) {
                var message = player.name + ' Would you like to buy ' + this.name + ' for £' + this.value + '?';
                log(message, 'warning');
                var buyIt = this.askQuestion(player, message);
                if (buyIt) {
                    this.buy(player, players);
                }
            }
        }
        return players;
    };

    /**
     * Buy the street
     * @param {Player} player Player buying the street
     * @param {array} playersArray of players
     */
    this.buy = function (player, players) {
        this.ownerID = player.id;
        var message = player.name + ' has bought ' + this.name;
        console.log(message);
        player.funds = (player.funds - this.value);
        player.boughtItems.push(this.name);

        log(message, player.cssClass);
        return players;
    };

    /**
     * Add a house to the street
     * @param {Player} player Owner of the street
     * @param {array} players Collection of players
     */
    this.addHouse = function (player, players) {
        this.totalHouses++;

        player.funds = player.funds - this.houseCost;

        var message = player.name + ' has added a house to ' + this.name;
        console.log(message);
        log(message, player.cssClass);
        return players;
    };

    /**
     * Pay rent
     * @param {Player} player The player paying rent
     * @param {array} players Collection of players
     */
    this.payRent = function (player, players) {
        var fee = (this.value * this.totalHouses) > 0 ? this.value * this.totalHouses : this.value;
        var ownerName = players[this.ownerID - 1].name;

        player.funds = player.funds - fee;

        players[this.ownerID - 1].funds = players[this.ownerID - 1].funds + fee;

        var message = player.name + ' has paid £' + fee + ' in rent to ' + ownerName;
        console.log(message);
        log(message, player.cssClass);

        return players;

    };

}
/**
 * Collect object Pass GO collect  £200
 * @param {array} config Collection of config
 * @returns {Collect}
 */
function Collect(config) {
    this.name = config.name;
    this.description = config.description;
    this.value = config.value;
    this.type = 'to_owner';

    this.performAction = function (Player) {
        console.log('Perfoming action collect');
    };
}

/**
 * Chance object
 * @param {array} config Collection of chance onfig
 * @returns {Chance}
 */
function Chance(config) {
    this.description = config.description;
    this.value = config.value;
    this.name = config.name;
    this.type = 'to_owner';

    this.performAction = function (Player) {
        console.log('Perfoming action in chance');
    };
}

/**
 * Community chest
 * @param {array} config Collection of community chest config
 * @returns {CommunityChest}
 */
function CommunityChest(config) {
    this.description = config.description;
    this.name = config.name;
    this.value = 0;
    this.type = 'to_owner';

    this.performAction = function (Player) {
        console.log('Perfoming action in community chest');
    };
}

/**
 * Monopoly game object
 * @param {array} board Collection of board config
 * @returns {Monopoly}
 */
function Monopoly(board) {
    this.steps = [];
    this.players = [];

    /**
     * Roll the dice
     * @returns {Monopoly.rollDice.dice}
     */
    this.rollDice = function () {
        var roll1 = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
        var roll2 = Math.floor(Math.random() * (6 - 1 + 1)) + 1;

        var dice = {
            die: [roll1, roll2],
            total: roll1 + roll2,
            isDouble: (roll1 === roll2) ? true : false
        };
        return dice;
    };

    /**
     * Set up the game
     * - Configure all the players
     * - Configure all the steps
     *
     * @param {array} board Board config
     */
    this.setup = function (board) {
        // Setup the board
        log('Board is setting up');
        this.steps = generateSteps(board);
        this.players = generatePlayers(board);
        log('Board is ready!');
    };

    /**
     * Generate the steps (street|community_chest|chance|collect)
     * @param {array} board Collection of board config
     * @returns {Array|Monopoly.generateSteps.items}
     */
    var generateSteps = function (board) {

        var l = board.steps.lengh;
        var items = [];
        var item = {};
        for (var i = 0; i < board.steps.length; i++) {

            // Instantiate step objects using polymorphism
            switch (board.steps[i].type) {
                case 'street':
                    item = new Street(board.steps[i]);
                    break;
                case 'community_chest':
                    item = new CommunityChest(board.steps[i]);
                    break;
                case 'chance':
                    item = new Chance(board.steps[i]);
                    break;
                case 'collect':
                    item = new Collect(board.steps[i]);
                    break;
            }

            items.push(item);

        }
        log('Added ' + items.length + ' steps to the game');
        return items;
    };

    /**
     * Generates the players
     * @param {type} board
     * @returns {Array|Monopoly.generatePlayers.players}
     */
    var generatePlayers = function (board) {

        var l = board.players.lengh;
        var players = [];
        var player = {};
        for (var i = 0; i < board.players.length; i++) {

            player = new Player(board.players[i]);
            players.push(player);
            log('Welcome ' + player.name);
            displayFunds(player);

        }
        return players;
    };

    /**
     * Process a players turn
     * @param {Player} The Player who is taking the turn
     */
    this.executeTurn = function (player) {
        log('<hr/>');

        log(player.name + ' is having a turn ', player.cssClass);

        var diceRoll = this.rollDice();
        log(player.name + ' has rolled ' + diceRoll.die[0] + ' and ' + diceRoll.die[1], player.cssClass);

        if (diceRoll.isDouble === true) {
            player.doubleRollCounter++;

            if (this.doubleRollCounter === 3) {
                this.putInJail(player);
            } else {

                log(player.name + ' Has rolled a double and gets another go', player.cssClass);
                console.log('Double has been rolled');

                // Roll again
                var bonusRoll = this.rollDice();
                // Excute turn
                this.movePlayer(player, bonusRoll.total);
            }
        } else {
            this.movePlayer(player, diceRoll.total);
        }
        return player;
    };

    /**
     * Moves the player to the step
     * @param {Player} player Player moving
     * @param {int} stepCount The position count
     */
    this.movePlayer = function (player, stepCount) {

        var pos = player.currentPosition + stepCount;
        // If the position is greater than the length of the steps find the difference and start over
        if (pos > this.steps.length) {
            var overlap = pos - this.steps.length;
            player.currentPosition = overlap;

        } else {
            player.currentPosition = pos;
        }

        var stepItem = this.steps[player.currentPosition];
        console.log(stepItem);
        if (stepItem) {
            log(player.name + ' has moved to ' + stepItem.name, player.cssClass);

            // Perfom the step action
            stepItem.performAction(player, this.players);

            // Update funds
            displayFunds(player);
        }
        return player;
    };

    /**
     * Put the player in jail
     * @param {Player} player The Player being sent to jail
     */
    this.putInJail = function (player) {

        var totalSteps = board.steps.length;

        for (var i = 0; i < totalSteps; i++) {

            if (board.steps[i].name === 'Jail') {
                player.inJail = true;
                player.doubleRollCounter = 0;
                player.currentPosition = i;

                console.log('YOUR IN JAIL');
            }
        }
        return player;
    };

    return this;
}