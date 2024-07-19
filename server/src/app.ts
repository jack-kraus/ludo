import { createServer } from "http";
import { Server, Socket } from "socket.io";
import RoomHandler from "./rooms";
import { z } from 'zod';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000"
    }
});
const rooms = new RoomHandler();

io.on("connection", (socket: Socket) => {
    // error message to user
    function error(content : string, callback? : any) {
        io.to(socket.id).emit("error", content);
        console.error(`To user ${socket.id}: ${content}`);
        if (callback) callback({ success : false, message : content});
    }

    // status message to user
    function message(content : string) {
        io.to(socket.id).emit("message", content);
        console.log(`To user ${socket.id}: ${content}`);
    }

    message('socket connected');

    socket.on("host", () => {
        // check if in a room
        if (socket.rooms.size >= 2) return error("Already in a room!");
        
        // else host
        let room_name : string;
        try { room_name = rooms.host(socket.id); }
        catch (e) { return error(`${e}`); }

        // return name
        socket.join(room_name);
        io.to(socket.id).emit("host", room_name);
    });

    socket.on("join", (room_id) => {
        // check if in a room
        if (socket.rooms.size >= 2) return error("Already in a room!");

        // join from room component
        try { rooms.join(socket.id, room_id.trim()); }
        catch (e) { return error(`${e}`); }

        // join room
        socket.join(room_id);
        io.to(socket.id).emit("status", "joined");
    });

    socket.on("start", () => {
        try {
            const { room, room_name } = rooms.get_room(socket.id, socket.rooms);
            room?.start(socket.id);
            io.to(room_name).emit("state", room?.game_state());
        }
        catch (e) { return error(`${e}`); }
    });

    socket.on("roll", (callback) => {
        try {
            const { room, room_name } = rooms.get_room(socket.id, socket.rooms);
            const { roll, moves } : any = room?.roll(socket.id);
            callback({success: true, roll, moves});
            if (!moves?.length) io.to(room_name).emit("state", room?.game_state());
        }
        catch (e) { return error(`${e}`); }
    });

    socket.on("move", (piece, callback) => {
        const pnum = parseInt(piece);
        if (isNaN(pnum)) {
            return error("Invalid number");
        }

        let game_state;
        try { game_state = rooms.move(socket.id, pnum, socket.rooms); }
        catch (e) { return error(`${e}`); }
        
        const { room } = game_state;
        io.to(room).emit("state", game_state);

        callback({success : true});
    });

    socket.on('disconnecting', () => {
        try {
            const {remaining, room_name, room} = rooms.disconnect(socket.id, socket.rooms);
            if (!remaining || remaining < 2) {
                io.to(room_name).emit("close");
                io.socketsLeave(room_name);
            }
            else {
                const game_state = room?.game_state();
                io.to(room_name).emit("user_left", game_state);
                io.to(room_name).emit("message", `User ${socket.id} left`);
            }
        }
        catch (e) { return console.error(`${e}`); }
    });
});

const PORT : number = parseInt(process.env.PORT ?? "4000");  // Use the PORT environment variable or default to 3000
httpServer.listen(PORT, "0.0.0.0", 511, () => console.log(`Server running on port ${PORT}`));