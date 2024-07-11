"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid4_1 = __importDefault(require("uuid4"));
const game_1 = __importDefault(require("./game"));
const ROOM_LIMIT = 10;
class RoomHandler {
    constructor() {
        this.rooms = new Map();
    }
    host(host_id) {
        if (this.rooms.size >= ROOM_LIMIT)
            throw "Room limit was hit";
        const room_id = (0, uuid4_1.default)();
        this.rooms.set(room_id, new game_1.default(host_id));
        return room_id;
    }
    join(user_id, room_id) {
        if (!this.rooms.has(room_id))
            throw "Room not found";
        this.rooms.get(room_id).join(user_id);
    }
    get_room(user_id, room_set) {
        if (room_set.size < 1)
            throw "User not in a room";
        room_set = new Set([...room_set]);
        room_set.delete(user_id);
        const room = room_set.keys().next().value;
        if (!this.rooms.has(room))
            throw "Room not found";
        return this.rooms.get(room);
    }
    roll(user_id, room_set) {
        const room = this.get_room(user_id, room_set);
        return room.roll(user_id);
    }
    move(user_id, piece, room_set) {
        const room = this.get_room(user_id, room_set);
        room.move(user_id, piece);
        return room.game_state();
    }
    admin_roll(user_id, amount, room_set) {
        const room = this.get_room(user_id, room_set);
        return room.roll(user_id, amount);
    }
    start(user_id, room_set) {
        const room = this.get_room(user_id, room_set);
        room.start(user_id);
    }
}
exports.default = RoomHandler;
//# sourceMappingURL=rooms.js.map