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
        this.users = [new Player(host_id, 0)];
        this.turn = 0;
        this.state = GameState.Idle;
    }
    // initialization
    join(user_id) {
        if (this.users.length >= ROOM_SIZE)
            throw "Room full";
        this.check_state(GameState.Idle);
        this.users.push(new Player(user_id, this.users.length));
    }
    start(user_id) {
        if (this.users[0].id !== user_id)
            throw "Host has to start game";
        else if (this.users.length <= 1)
            throw "Must have at least 2 players";
        this.check_state(GameState.Idle);
        this.state = GameState.Playing;
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
        return player.roll(amount);
    }
    move(user_id, piece) {
        this.check_playing();
        const player = this.check_turn(user_id);
        const displacement = this.get_displacement();
        const index = player.move(piece) + displacement * this.turn; // displacement in p1 number space
        // capturn in other space
        this.users.forEach((user, i) => {
            if (i === this.turn)
                return;
            user.capture(index - displacement * i);
        });
        this.next_turn();
    }
    // get state
    get_displacement() {
        return this.users.length === 2 ? DISPLACEMENT * 2 : DISPLACEMENT;
    }
    game_state() {
        const displacement = this.users.length === 2 ? DISPLACEMENT * 2 : DISPLACEMENT;
        const game_array = this.users.map((user, i) => user.pieces.map((piece) => piece < 0 ? piece : piece + displacement * i));
        const winners = this.users.filter((user) => user.has_won());
        return {
            board: game_array,
            winner: winners.length ? winners[0].id : undefined,
            turn: this.users[this.turn].id
        };
    }
}
const MAX_SPACE = 43;
const DIE_SIZE = 6;
class Player {
    constructor(user_id, player_number) {
        this.id = user_id;
        this.pieces = [-1, -1, -1, -1];
        this.player_number = player_number;
        this.roll_number = undefined;
    }
    is_me(user_id) {
        return this.id === user_id;
    }
    roll(amount) {
        if (this.roll_number !== undefined)
            throw "Already rolled!";
        this.roll_number = amount !== null && amount !== void 0 ? amount : Math.floor(Math.random() * DIE_SIZE) + 1;
        return this.roll_number;
    }
    move(piece) {
        if (this.roll_number === undefined)
            throw "Player hasn't rolled!";
        if (piece < 0 || piece > 3)
            throw "Invalid piece number";
        const target = this.pieces[piece] + this.roll_number;
        if (this.pieces.includes(target))
            throw "Invalid move: piece already there";
        else if (target > MAX_SPACE)
            throw "Invalid move: past last space";
        this.pieces[piece] = target;
        this.roll_number = undefined;
        return target;
    }
    capture(other) {
        this.pieces = this.pieces.map((index) => (index === other && index <= MAX_SPACE - 4) ? -1 : index);
    }
    has_won() {
        return this.pieces.every((piece) => piece >= MAX_SPACE - 4);
    }
}
exports.default = Game;
//# sourceMappingURL=game.js.map