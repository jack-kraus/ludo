import uuid4 from "uuid4";
import Game from "./game";

const ROOM_LIMIT = 10;

class RoomHandler {
    rooms : Map<string, Game>;
    
    constructor() {
        this.rooms = new Map();
    }

    host(host_id : string) {
        if (this.rooms.size >= ROOM_LIMIT) throw "Room limit was hit";
        const room_id = uuid4();
        this.rooms.set(room_id, new Game(host_id));
        return room_id;
    }

    join(user_id : string, room_id : string) {
        if (!this.rooms.has(room_id)) throw "Room not found";
        this.rooms.get(room_id).join(user_id);
    }

    get_room(user_id : string, room_set : Set<string>) {
        if (room_set.size < 1) throw "User not in a room";
        room_set = new Set<string>([...room_set]);
        room_set.delete(user_id);
        const room = room_set.keys().next().value;
        if (!this.rooms.has(room)) throw "Room not found";
        return this.rooms.get(room);
    }

    roll(user_id : string, room_set : Set<string>) {
        const room = this.get_room(user_id, room_set);
        return room.roll(user_id);
    }

    move(user_id : string, piece : number, room_set : Set<string>) {
        const room = this.get_room(user_id, room_set);
        room.move(user_id, piece);
        return room.game_state();
    }

    admin_roll(user_id : string, amount : number, room_set : Set<string>) {
        const room = this.get_room(user_id, room_set);
        return room.roll(user_id, amount);
    }

    start(user_id : string, room_set : Set<string>) {
        const room = this.get_room(user_id, room_set);
        room.start(user_id);
    }
}

export default RoomHandler;