from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websockets.manager import manager

router = APIRouter(prefix="/ws", tags=["WebSockets"])

@router.websocket("/simulations")
async def simulations_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # On garde la connexion ouverte et on écoute d'éventuels messages (même si on en n'attend pas forcément du client ici)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
