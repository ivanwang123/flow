export const prettyBytes = (num: number) => {
  let exponent,
    unit,
    neg = num < 0,
    units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  if (neg) num = -num;
  if (num < 1) return (neg ? "-" : "") + num + " B";
  exponent = Math.min(
    Math.floor(Math.log(num) / Math.log(1000)),
    units.length - 1
  );
  num = Number((num / Math.pow(1000, exponent)).toFixed(0));
  unit = units[exponent];
  return (neg ? "-" : "") + num + " " + unit;
};

export const percentage = (num: number) => {
  return `${Math.floor(num * 100)}%`;
};
