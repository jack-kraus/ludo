import { useState } from "react";
import { socket } from "../socket";

export default function Die({ status, setStatus, setMoves } : any) {
    const [roll, setRoll] = useState<null | number>(null);

    function doRoll() {
        socket.emit("roll", rollCallback);
    }

    function rollCallback({success, roll, moves} : {success : boolean, roll?: number, moves?: number[]}) {
        if (roll) { setRoll(roll); }
        if (success) { 
            setStatus("moving");
            if (moves) { setMoves(moves); }
            else { setMoves(null); }
        }
    }
    
    return <button className="w-10 h-10 bg-white text-black rounded-lg disabled:bg-slate-400" disabled={status!=="rolling"} onClick={()=>doRoll()}>{roll ?? "Roll"}</button>;
}