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

export const measureTextWidth = (text: string, font: string): number => {
  const span = document.createElement("span");
  span.style.visibility = "hidden"; // Make it invisible
  span.style.whiteSpace = "nowrap"; // Prevent line breaks
  span.style.font = font; // Apply font styles
  span.innerText = text;

  document.body.appendChild(span);
  const width = span.offsetWidth; // Get the width of the span
  document.body.removeChild(span); // Clean up
  return width;
};
