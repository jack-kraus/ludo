import { useState } from "react";
import { socket } from "../socket";
import Board from "./Board";
import Die from "./Die";

export default function GameManager({ game, status, setStatus } : { game : any, status : any, setStatus : any }) {
    const [moves, setMoves] = useState<null | number[]>(null);

    function moveWrapper(choice : number) {
        return () => socket.emit("move", choice, ()=>setMoves(null));
    }

    let { players, turn_index } = game;

    return <>
        <p>{players[turn_index].id === socket.id ? (status === "rolling" ? "Roll" : "Pick a piece to move") : `Player ${turn_index + 1}'s turn`}</p>
        <Board {...{game, moveWrapper, status, moves}}/>
        <Die {...{setMoves, status, setStatus}}/>
    </>
}