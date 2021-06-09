export type FileData = {
  id: string;
  name: string;
  size: number;
  magnetURI: string;
  createdAt: Date;
  userTag: string;
  username: string;
  available: boolean;
  downloaders: UserInfo[];
};

export interface ExtendFileData extends FileData {
  downloadSpeed: number | undefined;
  uploadSpeed: number | undefined;
  progress: number | undefined;
  timeRemaining: number | undefined;
}

export type UserInfo = {
  username: string;
  userTag: string;
};

export type User = {
  uid: string;
  username: string;
  tag: string;
  socketId: string;
  rooms: string[];
  uploads: string[];
};

export type Room = {
  id: string;
  name: string;
  users: UserInfo[];
  files: string[];
};
