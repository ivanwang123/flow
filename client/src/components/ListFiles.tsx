import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { FileData } from "../utils/types";
import FileInfo from "./FileInfo";
import { ReactComponent as Add } from "../assets/add.svg";
import { useDispatchCtx, useStateCtx } from "../contexts/storeCtx";
import { ReactComponent as UploadPic } from "../assets/upload-pic.svg";

function ListFiles() {
  const { tag, username, curRoomId, rooms, files, torrentHandler } =
    useStateCtx();
  const dispatch = useDispatchCtx();

  const [curRoomName, setCurRoomName] = useState<string>("");
  const [dropFile, setDropFile] = useState<string>("");

  useEffect(() => {
    const room = rooms.find((room) => room.id === curRoomId);
    if (room) {
      setCurRoomName(
        room.name
          ? room.name
          : room.users
              .filter((u) => u.userTag !== tag)
              .map((u) => u.username)
              .join(", ")
      );
      setDropFile("");
    }
  }, [curRoomId, rooms]);

  const addFile = (file: File) => {
    if (torrentHandler && file) {
      torrentHandler.seedFile(file, username, tag, curRoomId);
    }
  };

  const downloadFile = (file: FileData) => {
    return () => {
      if (torrentHandler && file.available) {
        torrentHandler.downloadTorrent(
          file.magnetURI,
          curRoomId,
          file.id,
          username,
          tag,
          dispatch
        );
      }
    };
  };

  const handleOnDrop = (acceptedFiles: File[]) => {
    setDropFile(acceptedFiles.map((file) => file.name).join(", "));
    acceptedFiles.forEach((file) => {
      addFile(file);
    });
  };

  // TODO: alerts
  return (
    <div className="w-full h-full px-4">
      {curRoomId ? (
        <>
          <h3 className="text-gray-400 text-4xl font-bold pl-2">
            {curRoomName}
          </h3>

          <Dropzone onDrop={handleOnDrop}>
            {({ getRootProps, getInputProps }) => (
              <section className="border-2 border-dashed border-gray-500 bg-gray-800 p-4 my-4 rounded cursor-pointer">
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <div className="flex items-center">
                    <Add className="w-16 h-16 fill-current text-gray-500 mr-4" />
                    <p className="text-gray-500">
                      {dropFile.length ? (
                        <span>{dropFile}</span>
                      ) : (
                        <span>
                          Drag and drop files, or click to select files
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </Dropzone>

          <div className="grid grid-cols-12 text-gray-500 pb-1">
            <div className="col-span-3 pl-2">File</div>
            <div className="text-right">Size</div>
            <div className="col-span-2 text-left pl-4">Host</div>
            <div className="col-span-2 text-left">Status</div>
            <div className="text-center">Progress</div>
            <div className="col-span-2 text-center">Remaining</div>
            <div className="text-center">Downloads</div>
          </div>
          <section className="flex flex-col">
            {files
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((file) => {
                return (
                  <FileInfo
                    file={file}
                    tag={tag}
                    downloadFile={downloadFile(file)}
                  />
                );
              })}
          </section>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <UploadPic className="w-1/3 h-auto opacity-30" />
          <p className="text-lg text-gray-500 mt-8">
            Select or create a new room to start sharing files
          </p>
        </div>
      )}
    </div>
  );
}

export default ListFiles;
