export const calculateSuiAge = (currentLunarYear: number, birthLunarYear: number): number => {
  if (!Number.isInteger(currentLunarYear) || !Number.isInteger(birthLunarYear)) {
    throw new TypeError("Lunar years must be integers.");
  }
  if (birthLunarYear > currentLunarYear) {
    throw new RangeError("Birth lunar year cannot be later than the current lunar year.");
  }
  return currentLunarYear - birthLunarYear + 1;
};
