function getSteps(inputBase, outputBase) {
  if (inputBase === outputBase) return "Same base, no steps.";
  if (inputBase === 10) return "Group 1: Decimal to Any (Division)";
  if (outputBase === 10) return "Group 2: Any to Decimal (Positional weight)";
  if (inputBase === 2 && (outputBase === 8 || outputBase === 16)) return "Group 3: Binary to Octal/Hex (Grouping)";
  if ((inputBase === 8 || inputBase === 16) && outputBase === 2) return "Group 4: Octal/Hex to Binary (Expanding)";
  if (inputBase === 8 && outputBase === 16) return "Group 5: Octal to Hex (Via Binary)";
  if (inputBase === 16 && outputBase === 8) return "Group 6: Hex to Octal (Via Binary)";
  return "Fallback";
}
console.log(getSteps(10, 2));
console.log(getSteps(2, 10));
console.log(getSteps(2, 8));
console.log(getSteps(16, 2));
console.log(getSteps(8, 16));
console.log(getSteps(16, 8));
