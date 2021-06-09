import { ActionKind, useDispatchCtx, useStateCtx } from "../contexts/storeCtx";
import CreateRoom from "./CreateRoom";

function ListRooms() {
  const { tag, curRoomId, rooms, socket } = useStateCtx();
  const dispatch = useDispatchCtx();

  const createRoom = (otherTags: string[]) => {
    if (socket && otherTags.length) {
      socket.emit("create-room", tag, otherTags);
    }
  };

  const enterRoom = (roomId: string) => {
    if (socket && roomId) {
      dispatch({ type: ActionKind.SetValue, payload: { curRoomId: roomId } });
      socket.emit("get-files", roomId);
    }
  };

  return (
    <div>
      <div className="flex">
        <h3 className="text-gray-500 text-lg font-bold mr-1">ROOMS</h3>
        <CreateRoom createRoom={createRoom} />
      </div>
      {/* TODO: Notifications? */}
      <div className="text-gray-500">
        {rooms.map((room) => {
          return (
            <div
              className={`w-40 px-2 py-1 -ml-2 truncate rounded cursor-pointer hover:bg-gray-800 ${
                room.id === curRoomId ? "bg-gray-800" : ""
              }`}
              onClick={() => enterRoom(room.id)}
              key={room.id}
            >
              {room.name
                ? room.name
                : room.users
                    .filter((u) => u.userTag !== tag)
                    .map((u) => u.username)
                    .join(", ")}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListRooms;
