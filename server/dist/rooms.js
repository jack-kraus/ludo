"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const game_1 = __importDefault(require("./game"));
const ROOM_LIMIT = 10;
class RoomHandler {
    constructor() {
        this.rooms = new Map();
    }
    host(host_id) {
        if (this.rooms.size >= ROOM_LIMIT)
            throw "Room limit was hit";
        const room_id = (0, uuid_1.v4)();
        this.rooms.set(room_id, new game_1.default(host_id));
        return room_id;
    }
    join(user_id, room_id) {
        if (!this.rooms.has(room_id))
            throw "Room not found";
        const room = this.rooms.get(room_id);
        if (room)
            room.join(user_id);
    }
    disconnect(user_id, room_set) {
        const { room, room_name } = this.get_room(user_id, room_set);
        const remaining = room === null || room === void 0 ? void 0 : room.disconnect(user_id);
        if (!remaining || remaining < 2)
            this.rooms.delete(room_name);
        return { room, remaining, room_name };
    }
    get_room(user_id, room_set) {
        if (room_set.size < 1)
            throw "User not in a room";
        room_set = new Set([...room_set]);
        room_set.delete(user_id);
        const room_name = room_set.keys().next().value;
        if (!this.rooms.has(room_name))
            throw "Room not found";
        return { room: this.rooms.get(room_name), room_name: room_name };
    }
    roll(user_id, room_set) {
        const { room, room_name } = this.get_room(user_id, room_set);
        if (!room)
            throw "Room not found";
        return Object.assign({ room_name }, room.roll(user_id));
    }
    move(user_id, piece, room_set) {
        const { room, room_name } = this.get_room(user_id, room_set);
        if (!room)
            throw "Room not found";
        room.move(user_id, piece);
        return Object.assign({ room: room_name }, room.game_state());
    }
}
exports.default = RoomHandler;
//# sourceMappingURL=rooms.js.map