import { KeyboardEvent, useState } from "react";
import { ReactComponent as Add } from "../assets/add.svg";
import { ReactComponent as Close } from "../assets/close.svg";
import { UserInfo } from "../utils/types";
import axios from "axios";

type Props = {
  createRoom: any;
};

function CreateRoom({ createRoom }: Props) {
  const [otherTag, setOtherTag] = useState<string>("");
  const [otherUsers, setOtherUsers] = useState<UserInfo[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const toggleModal = () => {
    setModalOpen((prevModal) => !prevModal);
    setOtherUsers([]);
    setOtherTag("");
  };

  const addOtherTag = () => {
    if (otherTag.length) {
      axios.get(`/user/${otherTag}`).then((res) => {
        const otherUser: UserInfo = {
          username: res.data.user.username,
          userTag: res.data.user.tag,
        };
        setOtherUsers((prevUsers) => [otherUser, ...prevUsers]);
      });
    }
    setOtherTag("");
  };

  const handleCreateRoom = () => {
    createRoom(otherUsers.map((user) => user.userTag));
    setModalOpen(false);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addOtherTag();
    }
  };

  return (
    <>
      <button type="button" onClick={toggleModal}>
        <Add className="fill-current text-gray-500" />
      </button>

      {modalOpen && (
        <div className="fixed top-0 left-0 grid place-items-center w-full h-full bg-gray-800 bg-opacity-80 z-50 overflow-auto">
          <div className="flex flex-col w-1/2 h-80 bg-gray-900 px-8 py-4 shadow rounded-lg">
            <div className="flex mb-4">
              <h3 className="text-gray-400 text-2xl font-bold">New Room</h3>
              <button
                type="button"
                className="text-gray-400 ml-auto"
                onClick={toggleModal}
              >
                <Close className="fill-current text-gray-500" />
              </button>
            </div>
            <div className="flex">
              <label className="text-gray-400 text-2xl font-bold mr-2">#</label>
              <input
                type="text"
                className="w-full py-1 px-2 rounded-l"
                placeholder="User tag number"
                value={otherTag}
                onChange={(e) => setOtherTag(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                className="flex items-center justify-center bg-gray-700 text-gray-400 font-semibold px-3 rounded-r"
                onClick={addOtherTag}
              >
                Add
              </button>
            </div>
            <div className="flex flex-col h-full text-gray-500 my-4 overflow-y-auto">
              <h6 className="font-bold">USERS {`(${otherUsers.length})`}</h6>
              {otherUsers.map((user) => (
                <span>
                  {user.userTag} - {user.username}
                </span>
              ))}
            </div>
            <div className="flex">
              <button
                type="button"
                className="bg-gray-800 text-gray-400 font-semibold px-3 py-1 ml-auto rounded"
                onClick={handleCreateRoom}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateRoom;
