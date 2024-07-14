import { useState, useEffect } from 'react';
import { socket } from './socket';
import ConnectionManager from './components/ConnectionManager';
import RoomForm from './components/RoomForm';
import GameManager from './components/GameManager';
import HostComponent from './components/HostComponent';

type Status = "offline" | "online" | "hosting" | "joined" | "playing" | "rolling" | "moving";
interface Message {
  type: "message" | "error",
  content: string
}
interface Game {
  winner : undefined | string,
  turn : string,
}

export default function App() {
  const [roomCode, setRoomCode] = useState<null | string>(null);
  const [status, setStatus] = useState<Status>(socket.connected ? "online" : "offline");

  function hostCallback({ success, room_name } : any) {
    if (success && room_name) {
      setRoomCode(room_name);
      setStatus("hosting");
    }
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [game, setGame] = useState<Game | null>(null);

  function addMessage(type: "message" | "error", content : string) {
    const newMessage = { type, content };
    setMessages((previous) => [...previous, newMessage]);
  }

  useEffect(() => {
    function onConnect() {
      setStatus("online");
    }

    function onDisconnect() {
      setStatus("offline");
    }

    function onHost(room_name : string) {
      setRoomCode(room_name);
      setStatus("hosting");
    }

    function onStatus(status : Status) {
      setStatus(status);
    }

    function onMessage(content : string) {
      addMessage("message", content);
    }

    function onError(content : string) {
      addMessage("error", content);
    }

    function onRoomClose() {
      addMessage("message", "Room closed...");
      setStatus("online");
    }

    function onState(game_state : Game) {
      setGame(game_state);
      const { turn } = game_state;
      if (turn === socket.id) { setStatus("rolling"); }
      else { setStatus("playing"); }
    }

    function onUserLeft(game_state : Game) {
      setGame(game_state);
      const { turn } = game_state;
      if (turn === socket.id && status !== "moving") { setStatus("rolling"); }
      else { setStatus("playing"); }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('status', onStatus);
    socket.on('message', onMessage);
    socket.on('error', onError);
    socket.on('state', onState);
    socket.on('host', onHost);
    socket.on('close', onRoomClose);
    socket.on('user_left', onUserLeft);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('status', onStatus);
      socket.off('message', onMessage);
      socket.off('error', onError);
      socket.off('state', onState);
      socket.off('host', onHost);
      socket.off('close', onRoomClose);
      socket.off('user_left', onUserLeft);
    };
  }, []);


  return (
    <div className='w-full flex flex-col gap-3 justify-center items-center'>
      { status === "online" && <RoomForm hostCallback={hostCallback}/> }
      { status === "hosting" && <HostComponent roomCode={roomCode}/> }
      {["playing", "rolling", "moving"].includes(status) && <GameManager game={game} status={status} setStatus={setStatus}/>}
      <ConnectionManager status={status}/>
      <p className='bold m-auto text-center'>Status: {status}</p>
      <ul>{messages && messages.map(({content}, index) => <li key={index}>{content}</li>)}</ul>
    </div>
  );
}