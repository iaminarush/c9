export const isNumber = (value: string | number) => {
  if (value === "") return false;
  if (typeof value === "string") {
    return !isNaN(Number(value));
  } else {
    return !isNaN(value);
  }
};

/**
 * Rounds a number up to the specified number of decimal places.
 *
 * @param value - The number to be rounded.
 * @param precision - The number of decimal places to round to.
 * @returns The rounded number.
 */
export const roundTo = (value: number, precision = 2) => {
  if (precision < 0) {
    throw new Error("Precision must be a non-negative integer.");
  }

  const factor = Math.pow(10, precision);
  return Math.ceil(value * factor) / factor;
};
