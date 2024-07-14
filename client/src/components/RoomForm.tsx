import { useState } from "react";
import { socket } from "../socket";

export default function RoomForm({hostCallback} : any) {
    const [host, setHost] = useState(true);
    
    function formSubmit(event : any) {
        event.preventDefault();
        const room_code = event.target.room?.value;
        if (host) {
            socket.emit("host", hostCallback);
        }
        else if (room_code) {
            socket.emit("join", room_code);
        }
    }

    return <>
        <select onChange={(e : any) => setHost(e.target.value === "host")}>
            <option value="host">Host</option>
            <option value="join">Join</option>
        </select>
        <form onSubmit={formSubmit}>
            {!host && <input name="room" placeholder="Enter room code..."/>}
            <button className="btn-primary" type="submit">Submit</button>
        </form>
    </>;
}