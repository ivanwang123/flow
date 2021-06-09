import { memo, useState } from "react";
import { ExtendFileData } from "../utils/types";
import { percentage, prettyBytes } from "../utils/humanize";
import { ReactComponent as Download } from "../assets/download.svg";
import { ReactComponent as Check } from "../assets/check-circle.svg";
import { ReactComponent as Share } from "../assets/share-circle.svg";
import prettyMilliseconds from "pretty-ms";

type Props = {
  file: ExtendFileData;
  tag: string;
  downloadFile: any;
};

function FileInfo({ file, tag, downloadFile }: Props) {
  const hosting = file.userTag === tag;

  const getStatusIcon = () => {
    if (file.available) {
      if (hosting) {
        // TODO: X on hover, stop sharing on click
        return (
          <div className="flex items-center px-2">
            <Share className="w-5 h-5 fill-current text-gray-500" />
          </div>
        );
      } else if (
        file.downloaders.some((downloader) => downloader.userTag === tag)
      ) {
        return (
          <CheckButton className="w-5 h-5" onClick={() => downloadFile(file)} />
        );
      } else {
        return (
          <button
            type="button"
            className="flex items-center px-2"
            onClick={() => downloadFile(file)}
          >
            <Download className="w-5 h-5 fill-current text-blue-500" />
          </button>
        );
      }
    } else {
      return (
        <div className="flex items-center px-2">
          <div className="w-5 h-5"></div>
        </div>
      );
    }
  };

  const getTimeRemaining = () => {
    if (!file.available) {
      return "";
    } else if (file.timeRemaining === undefined) {
      return "---";
    } else if (!isFinite(file.timeRemaining)) {
      return "Calculating...";
    } else if (file.timeRemaining === 0) {
      return "Done";
    } else {
      return prettyMilliseconds(Math.ceil(file.timeRemaining / 1000) * 1000);
    }
  };

  const getProgress = () => {
    if (!file.available) {
      return "";
    } else if (file.progress === undefined) {
      return "---";
    } else if (file.progress === 1) {
      return "Done";
    } else {
      return percentage(file.progress);
    }
  };

  return (
    <article
      className={`grid grid-cols-12 bg-gray-700 py-2 mb-1 rounded-lg ${
        file.available
          ? "bg-opacity-50 text-gray-400"
          : "bg-opacity-10 text-gray-600"
      }`}
      key={file.id}
    >
      <div className="flex col-span-3">
        {getStatusIcon()}
        <div className="truncate">{file.name}</div>
      </div>
      <div className="text-right">{prettyBytes(file.size)}</div>
      <div className="col-span-2 text-left truncate pl-4 pr-2">
        {file.username}
      </div>
      <div className="col-span-2 text-left truncate">
        {file.available ? (
          <>{hosting ? <span>Hosting</span> : <span>Available</span>}</>
        ) : (
          <span>Unavailable</span>
        )}
      </div>
      <div className="text-center">{!hosting && getProgress()}</div>
      <div className="col-span-2 text-center">
        {!hosting && getTimeRemaining()}
      </div>
      <div className="text-center truncate pr-2">
        <span>
          {file.downloaders.length ? `(${file.downloaders.length})` : "0"}
        </span>
        <span className="ml-1">
          {file.downloaders.map((downloader) => downloader.username).join(", ")}
        </span>
      </div>
    </article>
  );
}

export default memo(
  FileInfo,
  (prevProps, nextProps) =>
    prevProps.file.available === nextProps.file.available &&
    prevProps.file.progress === nextProps.file.progress &&
    prevProps.file.timeRemaining === nextProps.file.timeRemaining &&
    prevProps.file.downloaders === nextProps.file.downloaders
);

function CheckButton({ onClick }: any) {
  const [isHover, setIsHover] = useState<boolean>(false);

  return (
    <button
      type="button"
      className="px-2"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={onClick}
    >
      {isHover ? (
        <Download className="fill-current text-green-500" />
      ) : (
        <Check className="fill-current text-green-500" />
      )}
    </button>
  );
}
