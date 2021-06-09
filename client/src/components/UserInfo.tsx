import { useStateCtx } from "src/contexts/storeCtx";

function UserInfo() {
  const { tag, username } = useStateCtx();

  return (
    <div className="mb-8">
      <h3 className="text-gray-400 text-3xl font-bold">{username}</h3>
      <h6 className="text-gray-500 text-lg font-bold">#{tag}</h6>
    </div>
  );
}

export default UserInfo;
