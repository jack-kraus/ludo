import copy from "copy-to-clipboard"
import { socket } from "../socket"
import { useState } from "react"

export default function HostComponent({roomCode} : {roomCode : any}) {
    const [copied, setCopied] = useState(false);

    return <>
        <div className='flex flex-row'>
            <p className='bg-black p-2 rounded-l-md'>{roomCode}</p>
            <button onClick={()=>{ if(roomCode) { copy(roomCode); setCopied(true); } }} className='bg-orange-400 p-2 rounded-r-md'>{copied ? "copied" : "copy"}</button>
        </div>
        <button className="btn-primary" onClick={() => socket.emit("start")}>Start</button>
    </>
}