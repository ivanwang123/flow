import { createContext, Dispatch, useContext, useReducer } from "react";
import { Socket } from "socket.io-client";
import TorrentHandler from "src/utils/torrentHandler";
import { ExtendFileData, Room } from "../utils/types";

type State = {
  tag: string;
  username: string;
  curRoomId: string;
  rooms: Room[];
  files: ExtendFileData[];
  socket: Socket | null;
  torrentHandler: TorrentHandler | null;
};

export enum ActionKind {
  SetValue = "SET_VALUE",
  AddRoom = "ADD_ROOM",
  AddFile = "ADD_FILE",
  AddDownloader = "ADD_DOWNLOADER",
  RemoveDownloader = "REMOVE_DOWNLOADER",
  UpdateAvailability = "UPDATE_AVAILABILITY",
  UpdateProgress = "UPDATE_PROGRESS",
}

type Action = {
  type: ActionKind;
  payload: any;
};

const initialState: State = {
  tag: "",
  username: "",
  curRoomId: "",
  rooms: [],
  files: [],
  socket: null,
  torrentHandler: null,
};

const StateContext = createContext<State>(initialState);
const DispatchContext = createContext<Dispatch<Action> | undefined>(undefined);

export const useStateCtx = () => {
  return useContext(StateContext);
};

export const useDispatchCtx = () => {
  const context = useContext(DispatchContext);
  if (!context) {
    throw new Error("Unable to use dispatch context");
  }
  return context;
};

const reducer = (state: State, { type, payload }: Action): State => {
  switch (type) {
    case ActionKind.SetValue:
      return {
        ...state,
        ...payload,
      };
    case ActionKind.AddRoom:
      return {
        ...state,
        rooms: [payload, ...state.rooms],
      };
    case ActionKind.AddFile:
      return {
        ...state,
        files:
          payload.roomId === state.curRoomId
            ? [payload.file, ...state.files]
            : state.files,
      };
    case ActionKind.AddDownloader:
      return {
        ...state,
        files:
          payload.roomId === state.curRoomId
            ? state.files.map((file) => {
                if (file.id === payload.fileId) {
                  return {
                    ...file,
                    downloaders: [
                      {
                        username: payload.username,
                        userTag: payload.userTag,
                      },
                      ...file.downloaders,
                    ],
                  };
                }
                return file;
              })
            : state.files,
      };
    case ActionKind.RemoveDownloader:
      return {
        ...state,
        files:
          payload.roomId === state.curRoomId
            ? state.files.map((file) => {
                if (file.id === payload.fileId) {
                  file.downloaders = file.downloaders.filter(
                    (downloader) => downloader.userTag !== payload.userTag
                  );
                }
                return file;
              })
            : state.files,
      };
    case ActionKind.UpdateAvailability:
      return {
        ...state,
        files: state.files.map((file) => {
          if (file.userTag === payload.userTag) {
            file.available = false;
          }
          return file;
        }),
      };
    case ActionKind.UpdateProgress:
      return {
        ...state,
        files: state.files.map((file) => {
          if (file.id === payload.fileId) {
            return {
              ...file,
              downloadSpeed: payload.downloadSpeed,
              uploadSpeed: payload.uploadSpeed,
              progress: payload.progress,
              timeRemaining: payload.timeRemaining,
            };
          }
          return file;
        }),
      };
    default:
      return state;
  }
};

export function StoreProvider({ children }: any) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
}
