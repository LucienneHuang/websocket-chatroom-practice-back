import WebSocket, { WebSocketServer } from "ws";
const PORT = process.env.PORT || 4000;
const wss = new WebSocketServer({
    port: PORT
});
const clients = new Map();
wss.on('connection', (ws, req) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (!data.user) {
            ws.send(JSON.stringify({ error: "缺少使用者名稱" }));
            return;
        }
        clients.set(ws, data.user);
        if(data.type === 'join') {
            broadcast({ text: `${data.user} 加入了聊天室`});
        } else if(data.type === 'message') {
            broadcast(data);
        }
    });
    ws.on('error', console.error);
    ws.on("close", () => {
        const user = clients.get(ws);
        if(user) {
            broadcast({ text: `${user} 離開了聊天室`});
            clients.delete(ws);
        }
    });
})
const broadcast = (data) => {
    clients.forEach((_, client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
    });
}