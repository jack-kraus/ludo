"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameState;
(function (GameState) {
    GameState[GameState["Idle"] = 0] = "Idle";
    GameState[GameState["Playing"] = 1] = "Playing";
    GameState[GameState["Finished"] = 2] = "Finished";
})(GameState || (GameState = {}));
const ROOM_SIZE = 4;
const DISPLACEMENT = 10;
class Game {
    constructor(host_id) {
        this.count = 0;
        this.users = [new Player(host_id)];
        this.turn = 0;
        this.state = GameState.Idle;
    }
    // initialization
    join(user_id) {
        if (this.users.length >= ROOM_SIZE)
            throw "Room full";
        this.check_state(GameState.Idle);
        this.users.push(new Player(user_id));
    }
    start(user_id) {
        if (this.users[0].id !== user_id)
            throw "Host has to start game";
        else if (this.users.length <= 1)
            throw "Must have at least 2 players";
        this.users.forEach((user, i) => user.set_player_number(this.users.length === 2 ? i * 2 : i));
        this.check_state(GameState.Idle);
        this.state = GameState.Playing;
    }
    disconnect(user_id) {
        const turn_id = this.users[this.turn].id;
        this.users = this.users.filter((user) => user.id !== user_id);
        if (turn_id !== user_id)
            this.turn = this.users.findIndex((user) => user.id === turn_id);
        return this.users.length;
    }
    // checks
    check_playing() {
        this.check_state(GameState.Playing);
    }
    check_state(target) {
        if (this.state === GameState.Idle && target !== GameState.Idle)
            throw "Game hasn't started!";
        else if (this.state === GameState.Playing && target !== GameState.Playing)
            throw "Game already started!";
        else if (this.state === GameState.Finished && target !== GameState.Finished)
            throw "Game ended!";
    }
    check_turn(user_id) {
        if (!this.users[this.turn].is_me(user_id))
            throw "Not your turn!";
        return this.users[this.turn];
    }
    next_turn() {
        this.turn = (this.turn + 1) % this.users.length; // increment turn
    }
    // GAME MOVES
    roll(user_id, amount) {
        this.check_playing();
        const player = this.check_turn(user_id);
        let { roll, moves } = player.roll(amount);
        if (!moves.length)
            this.next_turn();
        return { roll, moves };
    }
    move(user_id, piece) {
        this.check_playing();
        const player = this.check_turn(user_id);
        const displacement = this.users[this.turn].player_number;
        const { roll, target } = player.move(piece);
        const index = target + displacement * this.turn; // displacement in p1 number space
        // capturn in other space
        this.users.forEach((user, i) => {
            if (i === this.turn)
                return;
            user.capture(index - displacement * i);
        });
        if (roll !== 6) {
            this.next_turn();
        }
    }
    // get state
    get_displacement() {
        return this.users.length === 2 ? DISPLACEMENT * 2 : DISPLACEMENT;
    }
    game_state() {
        const displacement = this.users.length === 2 ? DISPLACEMENT * 2 : DISPLACEMENT;
        const game_array = this.users.map((user) => user.pieces.map((piece) => {
            if (piece < 0)
                return -1; // if in base
            else if (piece > MAX_SPACE - 4)
                return MAX_SPACE - piece - 5; // if in home
            return (piece + displacement * user.player_number) % (MAX_SPACE - 3); // else return position respective to player 1
        }));
        const winners = this.users.filter((user) => user.has_won());
        return {
            board: game_array,
            winner: winners.length ? winners[0].id : undefined,
            turn: this.users[this.turn].id,
            turn_index: this.turn,
            players: this.users.map((user) => {
                return {
                    id: user.id,
                    player_number: user.player_number,
                    pieces: user.pieces.map((piece) => {
                        if (piece < 0)
                            return -1; // if in base
                        else if (piece > MAX_SPACE - 4)
                            return MAX_SPACE - piece - 5; // if in home
                        return (piece + displacement * user.player_number) % (MAX_SPACE - 3); // else return position respective to player 1
                    }),
                    roll_number: user.roll_number
                };
            })
        };
    }
}
const MAX_SPACE = 43;
const MAX_NON_HOME = MAX_SPACE - 4;
const DIE_SIZE = 6;
class Player {
    constructor(user_id) {
        this.id = user_id;
        this.pieces = [-1, -1, -1, -1];
        this.player_number = 0;
        this.roll_number = undefined;
    }
    set_player_number(player_number) {
        this.player_number = player_number;
    }
    is_me(user_id) {
        return this.id === user_id;
    }
    roll(amount) {
        if (!amount && this.roll_number !== undefined)
            throw "Already rolled!";
        const roll = amount !== null && amount !== void 0 ? amount : Math.floor(Math.random() * DIE_SIZE) + 1;
        const moves = this.possible_moves(roll);
        this.roll_number = moves.length ? roll : undefined;
        return { roll, moves };
    }
    possible_moves(roll_number) {
        const moves = [];
        for (let i = 0; i < 4; i++) {
            let piece = this.pieces[i];
            if (piece === -1 && roll_number === 6 && !this.pieces.includes(0))
                moves.push(i);
            else if (piece >= 0 && piece + roll_number <= MAX_SPACE && !this.pieces.includes(piece + roll_number))
                moves.push(i);
        }
        return moves;
    }
    move(piece) {
        if (this.roll_number === undefined)
            throw "Player hasn't rolled!";
        if (![0, 1, 2, 3].includes(piece))
            throw "Invalid piece number";
        if (this.pieces[piece] === -1 && this.roll_number !== 6)
            throw "Must roll a 6 to get out!";
        const roll = this.roll_number;
        const diff = this.pieces[piece] === -1 ? 1 : roll;
        const target = this.pieces[piece] + diff;
        if (this.pieces.includes(target))
            throw "Invalid move: piece already there";
        else if (target > MAX_SPACE)
            throw "Invalid move: past last space";
        this.pieces[piece] = target;
        this.roll_number = undefined;
        return { roll, target };
    }
    capture(other) {
        other = (other + MAX_NON_HOME + 1) % (MAX_NON_HOME + 1);
        console.log(other);
        console.log(this.pieces);
        this.pieces = this.pieces.map((index) => (index === other && index <= MAX_SPACE - 4) ? -1 : index);
    }
    has_won() {
        return this.pieces.every((piece) => piece >= MAX_SPACE - 4);
    }
}
exports.default = Game;
//# sourceMappingURL=game.js.map