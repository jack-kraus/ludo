"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const rooms_1 = __importDefault(require("./rooms"));
const httpServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(httpServer);
const rooms = new rooms_1.default();
io.on("connection", (socket) => {
    console.log('socket connected');
    socket.on("host", () => {
        if (socket.rooms.size > 2)
            console.error("User already in a room!");
        let room_name;
        try {
            room_name = rooms.host(socket.id);
        }
        catch (e) {
            return console.error(e);
        }
        socket.join(room_name);
        console.log(`user ${socket.id} created room: ${room_name}`);
    });
    socket.on("join", (room_id) => {
        if (socket.rooms.size > 2)
            console.error("User already in a room!");
        try {
            rooms.join(socket.id, room_id);
        }
        catch (e) {
            return console.error(e);
        }
        socket.join(room_id);
        console.log(`user ${socket.id} joined room: ${room_id}`);
    });
    socket.on("roll", () => {
        let count;
        try {
            count = rooms.roll(socket.id, socket.rooms);
        }
        catch (e) {
            return console.error(e);
        }
        console.log(`User ${socket.id} rolled a: ${count}`);
    });
    socket.on("move", (piece) => {
        const pnum = parseInt(piece);
        if (isNaN(pnum))
            return console.error("Invalid number");
        let game_state;
        try {
            game_state = rooms.move(socket.id, pnum, socket.rooms);
        }
        catch (e) {
            return console.error(e);
        }
        console.log(game_state);
    });
    socket.on("admin_roll", (amount) => {
        let count;
        try {
            count = rooms.admin_roll(socket.id, parseInt(amount), socket.rooms);
        }
        catch (e) {
            return console.error(e);
        }
        console.log(`User ${socket.id} rolled a: ${count}`);
    });
    socket.on("start", () => {
        try {
            rooms.start(socket.id, socket.rooms);
        }
        catch (e) {
            return console.error(e);
        }
        console.log("Game Started");
    });
});
httpServer.listen(3000);
//# sourceMappingURL=app.js.map