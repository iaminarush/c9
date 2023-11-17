export const isNumber = (value: string | number) => {
  if (value === "") return false;
  if (typeof value === "string") {
    return !isNaN(Number(value));
  } else {
    return !isNaN(value);
  }
};
