import { socket } from "../socket";

const home : {[color_index: string] : [number, number]} = {
    "r1": [1, 1],
    "r2": [1, 2],
    "r3": [2, 1],
    "r4": [2, 2],
    "g1": [1, 8],
    "g2": [1, 9],
    "g3": [2, 8],
    "g4": [2, 9],
    "y1": [8, 8],
    "y2": [8, 9],
    "y3": [9, 8],
    "y4": [9, 9],
    "b1": [8, 1],
    "b2": [8, 2],
    "b3": [9, 1],
    "b4": [9, 2]
}

const order = [
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],
    [3, 4],
    [2, 4],
    [1, 4],
    [0, 4],
    [0, 5],
    [0, 6],
    [1, 6],
    [2, 6],
    [3, 6],
    [4, 6],
    [4, 7],
    [4, 8],
    [4, 9],
    [4, 10],
    [5, 10],
    [6, 10],
    [6, 9],
    [6, 8],
    [6, 7],
    [6, 6],
    [7, 6],
    [8, 6],
    [9, 6],
    [10, 6],
    [10, 5],
    [10, 4],
    [9, 4],
    [8, 4],
    [7, 4],
    [6, 4],
    [6, 3],
    [6, 2],
    [6, 1],
    [6, 0],
    [5, 0]
]

const end : { [color:string] : [[number, number], [number, number], [number, number], [number, number]]} = {
    "r": [[5, 1], [5, 2], [5, 3], [5, 4]],
    "g": [[1, 5], [2, 5], [3, 5], [4, 5]],
    "y": [[5, 9], [5, 8], [5, 7], [5, 6]],
    "b": [[9, 5], [8, 5], [7, 5], [6, 5]]
}

export default function Board({ game, moveWrapper, status, moves } : any) {
    if (!game) return <></>;
    let { players } = game;
    console.log(players);

    function itemToMarker(place : number, player_index : number, piece_index : number, player_id : string) {
        const color = ['r','g','y','b'][player_index];
        
        const color_index = `${color}${piece_index+1}`;
        const source = `${color_index}.png`;
        const [row, column] = place >= 0 ? order[place] : (place < -1 ? end[color][-2-place] : home[color_index]);
        
        if (row === undefined || column === undefined) return <p>{JSON.stringify([row, column])}</p>
        
        return <button
            style={{
                gridRow: row+1,
                gridColumn: column+1
            }}
            onClick={moveWrapper(piece_index)}
            className={status === "moving" ? "disabled:brightness-50" : ""}
            disabled={status !== "moving" || socket.id !== player_id || !moves.includes(piece_index)}
        >
            <img src={source}/>
        </button>
    }

    return <div className="grid-cols-11 grid-rows-11 grid m-auto"
        style={{
            backgroundImage: "url(./ludo.png)",
            width: 400,
            height: 400,
            backgroundSize: "contain"
        }}>
        {players && players.map((player : any) => player && player.pieces.map((piece: any, piece_index: any) => itemToMarker(piece, player.player_number, piece_index, player.id))).flat()}
    </div>;
}