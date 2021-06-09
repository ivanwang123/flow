import axios from "axios";
import { useState } from "react";
import { useHistory } from "react-router";
import { ActionKind, useDispatchCtx } from "../contexts/storeCtx";

function Register() {
  const dispatch = useDispatchCtx();
  const history = useHistory();

  const [email, setEmail] = useState<string>("test@test.com");
  const [password, setPassword] = useState<string>("password");
  const [username, setUsername] = useState<string>("user1");

  const register = () => {
    axios
      .post("/register", {
        email: email,
        password: password,
        username: username,
      })
      .then((res) => {
        dispatch({ type: ActionKind.SetValue, payload: { tag: res.data.tag } });
        history.push("/login");
      });
  };

  return (
    <div className="w-full h-full grid place-items-center bg-gray-900">
      <div className="w-96 flex flex-col text-gray-400">
        <h3 className="text-3xl font-bold mb-4">Sign up</h3>
        <label className="font-semibold mb-1" htmlFor="email">
          Email
        </label>
        <input
          type="text"
          className="bg-gray-400 text-gray-900 px-2 py-1 mb-2 rounded"
          placeholder="Email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="font-semibold mb-1" htmlFor="username">
          Username
        </label>
        <input
          type="text"
          className="bg-gray-400 text-gray-900 px-2 py-1 mb-2 rounded"
          placeholder="Username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label className="font-semibold mb-1" htmlFor="password">
          Password
        </label>
        <input
          type="password"
          className="bg-gray-400 text-gray-900 px-2 py-1 mb-6 rounded"
          placeholder="Password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="w-min bg-gray-800 font-semibold px-8 py-2 mx-auto rounded"
          onClick={register}
        >
          Register
        </button>
        <span className="mx-auto mt-4">
          Already have an account?
          <a className="ml-1 text-blue-500" href="/login">
            Login
          </a>
        </span>
      </div>
    </div>
  );
}

export default Register;
