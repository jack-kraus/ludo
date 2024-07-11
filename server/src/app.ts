import { createServer } from "http";
import { Server, Socket } from "socket.io";
import RoomHandler from "./rooms";

const httpServer = createServer();
const io = new Server(httpServer);
const rooms = new RoomHandler();

io.on("connection", (socket: Socket) => {
    console.log('socket connected');

    socket.on("host", () => {
        if (socket.rooms.size > 2) console.error("User already in a room!");
        
        let room_name : string;
        try { room_name = rooms.host(socket.id); }
        catch (e) { return console.error(e); }

        socket.join(room_name);
        console.log(`user ${socket.id} created room: ${room_name}`);
    });

    socket.on("join", (room_id) => {
        if (socket.rooms.size > 2) console.error("User already in a room!");

        try { rooms.join(socket.id, room_id); }
        catch (e) { return console.error(e); }

        socket.join(room_id);
        console.log(`user ${socket.id} joined room: ${room_id}`);
    });

    socket.on("roll", () => {
        let count : number;
        try { count = rooms.roll(socket.id, socket.rooms); }
        catch (e) { return console.error(e); }
        
        console.log(`User ${socket.id} rolled a: ${count}`);
    });

    socket.on("move", (piece) => {
        const pnum = parseInt(piece);
        if (isNaN(pnum)) return console.error("Invalid number");

        let game_state : any;
        try { game_state = rooms.move(socket.id, pnum, socket.rooms); }
        catch (e) { return console.error(e); }
        
        console.log(game_state);
    });

    socket.on("admin_roll", (amount) => {
        let count : number;
        try { count = rooms.admin_roll(socket.id, parseInt(amount), socket.rooms); }
        
        catch (e) { return console.error(e); }
        
        console.log(`User ${socket.id} rolled a: ${count}`);
    });

    socket.on("start", () => {
        try { rooms.start(socket.id, socket.rooms); }
        catch (e) { return console.error(e); }
        
        console.log("Game Started");
    });
});

httpServer.listen(3000);