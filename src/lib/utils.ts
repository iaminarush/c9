export const isNumber = (value: string | number) => {
  if (typeof value === "string") {
    return !isNaN(Number(value));
  } else {
    return isNaN(value);
  }
};
