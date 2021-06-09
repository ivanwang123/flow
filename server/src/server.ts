import express from "express";
import http from "http";
import cors from "cors";
import randomize from "randomatic";
import { Server, Socket } from "socket.io";
import { db, auth } from "./firebase";
import firebase from "firebase/app";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.get("/", (_req, res) => {
  res.send("Flow");
});

app.post("/register", (req, res) => {
  const { email, password, username } = req.body;
  const tag = randomize("0", 4);

  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      db.collection("users")
        .doc(tag)
        .set({
          uid: userCredential.user?.uid,
          tag,
          username,
          socketId: "",
          rooms: [],
          uploads: [],
        })
        .then(() => {
          res.status(200).json({
            alert: "Register success!",
            tag: tag,
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({
            alert: "Failed to register user",
          });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        alert: "Failed to register user",
      });
    });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  auth.signInWithEmailAndPassword(email, password).then((userCredential) => {
    db.collection("users")
      .where("uid", "==", userCredential.user?.uid)
      .get()
      .then((querysnapshot) => {
        if (!querysnapshot.empty) {
          const user = querysnapshot.docs[0].data();
          res.cookie("uid", userCredential.user?.uid, {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true,
          });
          res.status(200).json({
            alert: "Login success!",
            user: user,
          });
        }
      })
      .catch(() => {
        res.status(400).json({
          alert: "Login fail",
          user: null,
        });
      });
  });
});

app.get("/me", (req, res) => {
  if (req.cookies["uid"]) {
    db.collection("users")
      .where("uid", "==", req.cookies["uid"])
      .get()
      .then((querysnapshot) => {
        if (!querysnapshot.empty) {
          const user = querysnapshot.docs[0].data();
          res.status(200).json({
            alert: "Got current user!",
            user: user,
          });
        }
      })
      .catch(() => {
        res.status(400).json({
          alert: "Get current user fail",
          user: null,
        });
      });
  } else {
    res.status(200).json({
      alert: "Got current user",
      user: null,
    });
  }
});

app.get("/user/:tag", (req, res) => {
  const tag = req.params.tag;
  db.collection("users")
    .doc(tag)
    .get()
    .then((docRef) => {
      if (docRef.exists) {
        res.status(200).json({
          alert: "Got user!",
          user: docRef.data(),
        });
      } else {
        res.status(400).json({
          alert: "User does not exist",
          user: null,
        });
      }
    })
    .catch(() => {
      res.status(500).json({
        alert: "Get user failed",
        user: null,
      });
    });
});

interface UserSocket extends Socket {
  tag: string;
}

io.on("connection", (socket: Socket) => {
  socket.on("user-connect", (tag) => {
    (socket as UserSocket).tag = tag;
    db.collection("users")
      .doc(tag)
      .get()
      .then(async (docRef) => {
        const user = docRef.data();
        if (user) {
          db.collection("users").doc(tag).update({
            socketId: socket.id,
          });
          socket.join(user.rooms);
          const rooms = await batchGetRequest("rooms", user.rooms);
          socket.emit("get-rooms", rooms);
        }
      });
  });

  socket.on("create-room", async (tag: string, others: string[]) => {
    const validUsers = await batchGetRequest("users", [tag, ...others]);

    if (validUsers.length > 1) {
      const roomId = randomize("Aa0", 4);
      const newRoom = {
        id: roomId,
        name: "",
        users: validUsers.map((user) => ({
          username: user.username,
          userTag: user.tag,
        })),
        files: [],
      };

      // Add new room to db
      db.collection("rooms").doc(roomId).set(newRoom);

      // Add room id to users' list of rooms
      validUsers.forEach((user) => {
        db.collection("users")
          .doc(user.tag)
          .update({
            rooms: firebase.firestore.FieldValue.arrayUnion(roomId),
          });
      });

      // Notify sockets to join new room
      validUsers.forEach((user) => {
        const socketId = user.socketId;
        if (socketId) {
          io.to(socketId).emit("join-room", newRoom);
        }
      });
    }
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("get-user", (tag: string) => {
    db.collection("users")
      .doc(tag)
      .get()
      .then((docRef) => {
        if (docRef.exists) {
          socket.emit("get-user", docRef.data);
        }
      });
  });

  socket.on("get-rooms", async (roomIds: string[]) => {
    const rooms = await batchGetRequest("rooms", roomIds);
    socket.emit("get-rooms", rooms);
  });

  socket.on("get-files", async (roomId: string) => {
    try {
      const docRef = await db.collection("rooms").doc(roomId).get();
      if (docRef.exists) {
        const fileIds: string[] = docRef.data()!.files;
        const files = await batchGetRequest("files", fileIds);
        socket.emit("get-files", files);
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("upload-file", (userTag: string, roomId: string, fileData: any) => {
    const docRef = db.collection("files").doc();
    const newFileData = {
      ...fileData,
      id: docRef.id,
    };
    docRef.set(newFileData).then(() => {
      db.collection("rooms")
        .doc(roomId)
        .update({
          files: firebase.firestore.FieldValue.arrayUnion(docRef.id),
        });
      db.collection("users")
        .doc(userTag)
        .update({
          uploads: firebase.firestore.FieldValue.arrayUnion(docRef.id),
        });
      io.in(roomId).emit("add-file", roomId, newFileData);
    });
  });

  socket.on(
    "downloaded-file",
    (roomId: string, fileId: string, username: string, userTag: string) => {
      db.collection("files")
        .doc(fileId)
        .update({
          downloaders: firebase.firestore.FieldValue.arrayUnion({
            username,
            userTag,
          }),
        });
      io.in(roomId).emit("downloaded-file", roomId, fileId, username, userTag);
    }
  );

  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
  });

  socket.on("disconnecting", () => {
    const tag = (socket as UserSocket).tag;
    db.collection("users")
      .doc(tag)
      .get()
      .then((docRef) => {
        if (docRef.exists) {
          const uploads: string[] = docRef.data()!.uploads;
          uploads.forEach((upload) => {
            db.collection("files").doc(upload).update({
              available: false,
            });
          });

          db.collection("users").doc(tag).update({
            socketId: "",
            uploads: [],
          });
        }
      });

    socket.broadcast.to(Array.from(socket.rooms)).emit("user-disconnect", tag);
  });
});

const batchGetRequest = async (
  collection: string,
  ids: string[]
): Promise<firebase.firestore.DocumentData[]> => {
  if (ids.length) {
    let batch: Promise<firebase.firestore.DocumentData[]>[] = [];
    for (let i = 0; i < ids.length; i += 10) {
      batch.push(
        db
          .collection(collection)
          .where(
            firebase.firestore.FieldPath.documentId(),
            "in",
            ids.slice(i, i + 10)
          )
          .get()
          .then((querySnapshot) =>
            querySnapshot.docs.map((docRef) => docRef.data())
          )
          .catch(() => [])
      );
    }
    const res = await Promise.all(batch);
    let files: firebase.firestore.DocumentData[] = [];
    files = files.concat(...res);
    return files;
  } else {
    return [];
  }
};

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
