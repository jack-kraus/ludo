import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws : Record<string, any>) {
    ws.on('message', function message(data : Record<string, any>) {
        console.log('got: %s', data);
    });

    ws.send('something');
});