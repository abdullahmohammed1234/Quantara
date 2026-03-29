"""
WebSocket module for real-time quantum simulation results
and collaborative circuit building
"""
import asyncio
import json
from datetime import datetime
from typing import Dict, Set, Optional
from fastapi import WebSocket, WebSocketDisconnect
from collections import defaultdict


class ConnectionManager:
    """
    Manages WebSocket connections for real-time updates
    and collaborative circuit building
    """
    
    def __init__(self):
        # Active connections by room/channel
        self.active_connections: Dict[str, Set[WebSocket]] = defaultdict(set)
        # User session info
        self.user_sessions: Dict[WebSocket, dict] = {}
        # Simulation jobs in progress
        self.simulation_jobs: Dict[str, dict] = {}
    
    async def connect(self, websocket: WebSocket, room: str = "default", user_info: dict = None):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[room].add(websocket)
        self.user_sessions[websocket] = {
            "room": room,
            "user_id": user_info.get("user_id") if user_info else None,
            "username": user_info.get("username") if user_info else None,
            "connected_at": datetime.utcnow().isoformat()
        }
        print(f"WebSocket connected: room={room}, users={len(self.active_connections[room])}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.user_sessions:
            room = self.user_sessions[websocket]["room"]
            self.active_connections[room].discard(websocket)
            del self.user_sessions[websocket]
            print(f"WebSocket disconnected: room={room}, users={len(self.active_connections[room])}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific connection"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending message: {e}")
    
    async def broadcast(self, message: dict, room: str = "default"):
        """Broadcast a message to all connections in a room"""
        if room not in self.active_connections:
            return
        
        disconnected = set()
        for connection in self.active_connections[room]:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error broadcasting: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected
        for connection in disconnected:
            self.disconnect(connection)
    
    async def send_to_room(self, message: dict, room: str, exclude: WebSocket = None):
        """Send a message to all connections in a room except specified"""
        if room not in self.active_connections:
            return
        
        for connection in self.active_connections[room]:
            if connection != exclude:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending to room: {e}")
    
    def get_room_users(self, room: str) -> list:
        """Get list of users in a room"""
        users = []
        for ws, info in self.user_sessions.items():
            if info["room"] == room:
                users.append(info)
        return users


# Global connection manager instance
manager = ConnectionManager()


# WebSocket message types
class WSMessageType:
    SIMULATION_START = "simulation_start"
    SIMULATION_PROGRESS = "simulation_progress"
    SIMULATION_RESULT = "simulation_result"
    SIMULATION_ERROR = "simulation_error"
    COLLABORATION_JOIN = "collaboration_join"
    COLLABORATION_LEAVE = "collaboration_leave"
    COLLABORATION_UPDATE = "collaboration_update"
    COLLABORATION_SYNC = "collaboration_sync"
    PING = "ping"
    PONG = "pong"


async def handle_simulation_websocket(websocket: WebSocket, room: str = "default"):
    """
    Handle a quantum simulation WebSocket connection
    """
    await manager.connect(websocket, room)
    
    try:
        # Send welcome message
        await manager.send_personal_message({
            "type": WSMessageType.COLLABORATION_JOIN,
            "room": room,
            "users": manager.get_room_users(room)
        }, websocket)
        
        # Broadcast to room
        await manager.broadcast({
            "type": WSMessageType.COLLABORATION_JOIN,
            "user": manager.user_sessions.get(websocket, {}),
            "users": manager.get_room_users(room)
        }, room)
        
        # Handle incoming messages
        while True:
            try:
                data = await websocket.receive_json()
                await handle_websocket_message(websocket, data, room)
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"WebSocket error: {e}")
                await manager.send_personal_message({
                    "type": WSMessageType.SIMULATION_ERROR,
                    "error": str(e)
                }, websocket)
                
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket)
        # Broadcast leave
        await manager.broadcast({
            "type": WSMessageType.COLLABORATION_LEAVE,
            "user": manager.user_sessions.get(websocket, {}),
            "users": manager.get_room_users(room)
        }, room)


async def handle_websocket_message(websocket: WebSocket, data: dict, room: str):
    """Handle incoming WebSocket messages"""
    message_type = data.get("type")
    
    if message_type == "simulation_start":
        # Start a simulation, broadcast to room
        circuit = data.get("circuit", [])
        await manager.broadcast({
            "type": WSMessageType.SIMULATION_START,
            "circuit": circuit,
            "user": manager.user_sessions.get(websocket, {})
        }, room)
        
    elif message_type == "simulation_result":
        # Broadcast simulation result
        result = data.get("result", {})
        await manager.broadcast({
            "type": WSMessageType.SIMULATION_RESULT,
            "result": result,
            "user": manager.user_sessions.get(websocket, {})
        }, room)
        
    elif message_type == "collaboration_update":
        # Circuit update from user
        circuit = data.get("circuit", {})
        await manager.send_to_room({
            "type": WSMessageType.COLLABORATION_UPDATE,
            "circuit": circuit,
            "user": manager.user_sessions.get(websocket, {})
        }, room, exclude=websocket)
        
    elif message_type == "collaboration_sync":
        # Request sync from others
        await manager.send_to_room({
            "type": WSMessageType.COLLABORATION_SYNC,
            "from_user": manager.user_sessions.get(websocket, {})
        }, room, exclude=websocket)
        
    elif message_type == "ping":
        await manager.send_personal_message({
            "type": WSMessageType.PONG
        }, websocket)


# Helper to run simulation and broadcast results
async def run_simulation_with_progress(circuit, websocket: WebSocket = None, room: str = "default"):
    """
    Run a quantum circuit simulation and send progress updates
    """
    import random
    
    # Simulate progress updates
    for progress in [0, 25, 50, 75, 100]:
        await manager.broadcast({
            "type": WSMessageType.SIMULATION_PROGRESS,
            "progress": progress,
            "circuit": circuit
        }, room)
        await asyncio.sleep(0.2)
    
    # Generate mock results (in real implementation, this would call the actual simulator)
    p0 = random.random()
    p1 = 1 - p0
    
    result = {
        "circuit": circuit,
        "probabilities": {"0": round(p0, 4), "1": round(p1, 4)},
        "noise_enabled": False,
        "noise_level": 0,
        "shots": 1000
    }
    
    return result