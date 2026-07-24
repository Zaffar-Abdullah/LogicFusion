export function generateTruthTable(variables: string[], minterms: number[]) {
  const rows = [];
  const total = Math.pow(2, variables.length);
  const mintermSet = new Set(minterms);

  for (let i = 0; i < total; i++) {
    const binary = i.toString(2).padStart(variables.length, "0");
    const row: any = {};
    for (let j = 0; j < variables.length; j++) {
      row[variables[j]] = parseInt(binary[j]);
    }
    row.f = mintermSet.has(i) ? 1 : 0;
    rows.push(row);
  }
  return rows;
}
