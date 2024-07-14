import { socket } from '../socket';

export default function ConnectionManager({status} : {status : string}) {
  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  return (
    <div>
      {status === "offline" ? <button className="btn-primary" onClick={ connect }>Connect</button>
       : <button className="btn-primary" onClick={ disconnect }>Disconnect</button>}
    </div>
  );
}