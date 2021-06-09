import { Dispatch } from "react";
import { io } from "socket.io-client";
import { ActionKind } from "../contexts/storeCtx";
import TorrentHandler from "./torrentHandler";
import { ExtendFileData, FileData } from "./types";

export const connectSocket = (tag: string, dispatch: Dispatch<any>) => {
  const socket = io("http://localhost:5000");
  dispatch({ type: ActionKind.SetValue, payload: { socket } });

  socket.on("connect", () => {
    socket.emit("user-connect", tag);
  });

  socket.on("add-file", (roomId: string, fileData: FileData) => {
    const extendFileData: ExtendFileData = {
      ...fileData,
      downloadSpeed: undefined,
      uploadSpeed: undefined,
      progress: undefined,
      timeRemaining: undefined,
    };
    dispatch({
      type: ActionKind.AddFile,
      payload: { file: extendFileData, roomId },
    });
  });

  socket.on(
    "downloaded-file",
    (roomId: string, fileId: string, username: string, userTag: string) => {
      dispatch({
        type: ActionKind.AddDownloader,
        payload: { roomId, fileId, username, userTag },
      });
    }
  );

  socket.on("get-user", (user: any) => {
    if (user) {
      dispatch({ type: ActionKind.SetValue, payload: { rooms: user.rooms } });
    }
  });

  socket.on("get-rooms", (rooms: any[]) => {
    dispatch({ type: ActionKind.SetValue, payload: { rooms } });
  });

  socket.on("get-files", (files: any[]) => {
    dispatch({ type: ActionKind.SetValue, payload: { files } });
  });

  socket.on("join-room", (room: any) => {
    dispatch({ type: ActionKind.AddRoom, payload: room });
    socket.emit("join-room", room.id);
  });

  socket.on("user-disconnect", (userTag: string) => {
    dispatch({ type: ActionKind.UpdateAvailability, payload: { userTag } });
  });

  const torrentHandler = new TorrentHandler(socket);
  dispatch({ type: ActionKind.SetValue, payload: { torrentHandler } });
};
