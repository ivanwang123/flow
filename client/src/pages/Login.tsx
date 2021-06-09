import axios from "axios";
import { useState } from "react";
import { useHistory } from "react-router";
import { connectSocket } from "../utils/socketHandler";
import { ActionKind, useDispatchCtx } from "../contexts/storeCtx";

function Login() {
  const dispatch = useDispatchCtx();

  const history = useHistory();

  const [email, setEmail] = useState<string>("test@test.com");
  const [password, setPassword] = useState<string>("password");

  const login = () => {
    axios
      .post("/login", {
        email: email,
        password: password,
      })
      .then((res) => {
        dispatch({
          type: ActionKind.SetValue,
          payload: { tag: res.data.user.tag, username: res.data.user.username },
        });
        connectSocket(res.data.user.tag, dispatch);
        history.push("/");
      })
      .catch((err) => console.error("LOGIN", err));
  };

  return (
    <div className="w-full h-full grid place-items-center bg-gray-900 text-gray-400">
      <div className="flex flex-col w-96">
        <h3 className="text-3xl font-bold mb-4">Login</h3>
        <label className="font-semibold mb-1" htmlFor="email">
          Email
        </label>
        <input
          type="text"
          className="bg-gray-400 text-gray-900 px-2 py-1 mb-2 rounded"
          placeholder="Email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="font-semibold mb-1" htmlFor="password">
          Password
        </label>
        <input
          type="text"
          className="bg-gray-400 text-gray-900 px-2 py-1 mb-6 rounded"
          placeholder="Password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="w-min bg-gray-800 font-semibold px-8 py-2 mx-auto rounded"
          onClick={login}
        >
          Login
        </button>
        <span className="mx-auto mt-4">
          Need an account?
          <a className="ml-1 text-blue-500" href="/register">
            Sign up
          </a>
        </span>
      </div>
    </div>
  );
}

export default Login;
