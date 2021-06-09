import { useEffect } from "react";
import { useDispatchCtx, ActionKind, useStateCtx } from "../contexts/storeCtx";
import axios from "axios";
import { connectSocket } from "../utils/socketHandler";
import { useHistory } from "react-router-dom";
import ListRooms from "../components/ListRooms";
import ListFiles from "../components/ListFiles";
import UserInfo from "../components/UserInfo";

function Home() {
  const { socket } = useStateCtx();
  const dispatch = useDispatchCtx();

  const history = useHistory();

  useEffect(() => {
    if (!socket) {
      axios
        .get("/me")
        .then((res) => {
          if (res.data.user) {
            dispatch({
              type: ActionKind.SetValue,
              payload: {
                tag: res.data.user.tag,
                username: res.data.user.username,
              },
            });

            connectSocket(res.data.user.tag, dispatch);
          } else {
            history.push("/login");
          }
        })
        .catch(() => history.push("/login"));
    }
  }, [socket]);

  return (
    <main className="main-grid w-full min-h-full bg-gray-900">
      {/* TODO: Adding users */}
      <section className="p-6">
        <UserInfo />
        <ListRooms />
      </section>
      <section className="p-6">
        <ListFiles />
      </section>
    </main>
  );
}

export default Home;
