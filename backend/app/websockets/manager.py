from fastapi import WebSocket
from typing import Dict


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_notification(self, user_id: int, message: str, unread_count: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(
                {"msg": message, "unread_count": unread_count}
            )


manager = ConnectionManager()
