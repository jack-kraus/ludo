import { v4 as uuidv4 } from 'uuid';
import Game from "./game";

const ROOM_LIMIT = 10;

class RoomHandler {
    rooms : Map<string, Game>;
    
    constructor() {
        this.rooms = new Map();
    }

    host(host_id : string) {
        if (this.rooms.size >= ROOM_LIMIT) throw "Room limit was hit";
        const room_id = uuidv4();
        this.rooms.set(room_id, new Game(host_id));
        return room_id;
    }

    join(user_id : string, room_id : string) {
        if (!this.rooms.has(room_id)) throw "Room not found";
        const room = this.rooms.get(room_id);
        if (room) room.join(user_id);
    } 

    disconnect(user_id : string, room_set : Set<string>) {
        const {room, room_name} = this.get_room(user_id, room_set);
        const remaining = room?.disconnect(user_id);
        if (!remaining || remaining < 2) this.rooms.delete(room_name);
        return {room, remaining, room_name};
    }

    get_room(user_id : string, room_set : Set<string>) {
        if (room_set.size < 1) throw "User not in a room";
        room_set = new Set<string>([...room_set]);
        room_set.delete(user_id);
        const room_name = room_set.keys().next().value;
        if (!this.rooms.has(room_name)) throw "Room not found";
        return { room : this.rooms.get(room_name), room_name : room_name };
    }

    roll(user_id : string, room_set : Set<string>) {
        const {room, room_name} = this.get_room(user_id, room_set);
        if (!room) throw "Room not found";
        return {room_name, ...room.roll(user_id)};
    }

    move(user_id : string, piece : number, room_set : Set<string>) {
        const {room, room_name} = this.get_room(user_id, room_set);
        if (!room) throw "Room not found";
        room.move(user_id, piece);
        return {room: room_name, ...room.game_state()};
    }
}

export default RoomHandler;