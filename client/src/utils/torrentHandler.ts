import { Dispatch } from "react";
import { Socket } from "socket.io-client";
import { ActionKind } from "src/contexts/storeCtx";
import { throttle } from "throttle-debounce";
import WebTorrent from "webtorrent";
import { FileData } from "./types";

export default class TorrentHandler {
  socket: Socket;
  client: WebTorrent.Instance;

  constructor(socket: Socket) {
    this.socket = socket;
    this.client = new WebTorrent();

    this.client.on("error", (err) => {
      console.error(err);
    });
  }

  downloadTorrent(
    magnetURI: string,
    roomId: string,
    fileId: string,
    username: string,
    userTag: string,
    dispatch: Dispatch<any>
  ) {
    this.client.add(magnetURI, (torrent) => {
      const onProgress = () => {
        dispatch({
          type: ActionKind.UpdateProgress,
          payload: {
            fileId,
            downloadSpeed: torrent.downloadSpeed,
            uploadSpeed: torrent.uploadSpeed,
            progress: torrent.progress,
            timeRemaining: torrent.timeRemaining,
          },
        });
      };

      const onDone = () => {
        onProgress();
        torrent.files.forEach((file) => {
          file.getBlobURL((err, url) => {
            if (err) return;
            if (url) {
              const a = document.createElement("a");
              a.target = "_blank";
              a.download = file.name;
              a.href = url;
              a.textContent = "Download " + file.name;
              a.click();
            }
          });
        });
        torrent.destroy();
        this.socket.emit("downloaded-file", roomId, fileId, username, userTag);
      };

      torrent.on("download", throttle(250, onProgress));
      torrent.on("upload", throttle(250, onProgress));
      torrent.on("done", onDone);
    });
  }

  seedFile(file: File, username: string, userTag: string, roomId: string) {
    this.client.seed(file, (torrent) => {
      const fileData: FileData = {
        id: "",
        name: file.name,
        size: torrent.length,
        magnetURI: torrent.magnetURI,
        createdAt: new Date(),
        userTag: userTag,
        username: username,
        available: true,
        downloaders: [],
      };
      this.socket.emit("upload-file", userTag, roomId, fileData);
    });
  }
}
