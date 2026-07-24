export function getMintermsFromSOP(expression: string, vars: string[] = ['w', 'x', 'y', 'z']): number[] {
  if (!expression.trim()) return [];
  const terms = expression.toLowerCase().replace(/\s+/g, '').split('+');
  const minterms = new Set<number>();
  
  for (let i = 0; i < Math.pow(2, vars.length); i++) {
    const bin = i.toString(2).padStart(vars.length, '0');
    let evalToTrue = false;
    
    for (const term of terms) {
      let termTrue = true;
      for (let j = 0; j < vars.length; j++) {
        const v = vars[j];
        const val = bin[j] === '1';
        
        // Find if v is in term
        const idx = term.indexOf(v);
        if (idx !== -1) {
          const isComplement = term.charAt(idx + 1) === "'";
          if ((isComplement && val) || (!isComplement && !val)) {
            termTrue = false;
            break;
          }
        }
      }
      if (termTrue) {
        evalToTrue = true;
        break;
      }
    }
    if (evalToTrue) {
      minterms.add(i);
    }
  }
  
  return Array.from(minterms).sort((a, b) => a - b);
}

function countOnes(n: number): number {
  return n.toString(2).split('1').length - 1;
}

export function quineMcCluskey(minterms: number[], numVars: number = 4): { result: string, steps: {title: string, details: string}[] } {
  const steps: {title: string, details: string}[] = [];
  
  if (minterms.length === 0) {
    steps.push({ title: "Result", details: "Expression is always 0." });
    return { result: "0", steps };
  }
  if (minterms.length === Math.pow(2, numVars)) {
    steps.push({ title: "Result", details: "Expression is always 1 (Tautology)." });
    return { result: "1", steps };
  }

  steps.push({
    title: "Step 1: Identify Minterms",
    details: `Given the input expression, the standard minterms (where output is 1) are: Σm(${minterms.join(', ')}).`
  });

  let groups: { [key: number]: string[] } = {};
  for (let i = 0; i <= numVars; i++) groups[i] = [];
  
  for (const m of minterms) {
    const bin = m.toString(2).padStart(numVars, '0');
    groups[countOnes(m)].push(bin);
  }

  steps.push({
    title: "Step 2: Group Minterms by 1s",
    details: `Minterms are converted to binary and grouped by the number of 1s they contain. This prepares them for combining.`
  });

  let implicants = new Set<string>();
  let hasMerged = true;
  let currentGroups = groups;
  let pass = 1;

  while (hasMerged) {
    hasMerged = false;
    let nextGroups: { [key: number]: string[] } = {};
    for (let i = 0; i <= numVars; i++) nextGroups[i] = [];
    let merged = new Set<string>();

    for (let i = 0; i < numVars; i++) {
      for (const a of currentGroups[i] || []) {
        for (const b of currentGroups[i + 1] || []) {
          let diffCount = 0;
          let diffIdx = -1;
          for (let k = 0; k < numVars; k++) {
            if (a[k] !== b[k]) {
              diffCount++;
              diffIdx = k;
            }
          }
          if (diffCount === 1) {
            hasMerged = true;
            merged.add(a);
            merged.add(b);
            const combined = a.substring(0, diffIdx) + '-' + a.substring(diffIdx + 1);
            const ones = combined.split('1').length - 1;
            if (!nextGroups[ones].includes(combined)) {
              nextGroups[ones].push(combined);
            }
          }
        }
      }
    }

    let unmergedPass = [];
    for (let i = 0; i <= numVars; i++) {
      for (const a of currentGroups[i] || []) {
        if (!merged.has(a)) {
          implicants.add(a);
          unmergedPass.push(a);
        }
      }
    }
    
    if (hasMerged) {
      steps.push({
        title: `Step 3.${pass}: Combine Adjacent Terms`,
        details: `Terms differing by exactly one variable are combined (e.g., xy'z + xyz = xz). New terms formed in this pass.`
      });
      currentGroups = nextGroups;
      pass++;
    }
  }

  const implicantList = Array.from(implicants);
  steps.push({
    title: "Step 4: Identify Prime Implicants",
    details: `Terms that cannot be combined further are Prime Implicants: [${implicantList.join(', ')}].`
  });

  let remainingMinterms = new Set(minterms);
  let finalImplicants: string[] = [];
  const covers: { [key: string]: number[] } = {};
  
  for (const imp of implicantList) {
    covers[imp] = [];
    for (const m of minterms) {
      const bin = m.toString(2).padStart(numVars, '0');
      let matches = true;
      for (let k = 0; k < numVars; k++) {
        if (imp[k] !== '-' && imp[k] !== bin[k]) {
          matches = false;
          break;
        }
      }
      if (matches) covers[imp].push(m);
    }
  }

  let essentials: string[] = [];
  for (const m of minterms) {
    const covering = implicantList.filter(imp => covers[imp].includes(m));
    if (covering.length === 1) {
      const essential = covering[0];
      if (!finalImplicants.includes(essential)) {
        finalImplicants.push(essential);
        essentials.push(essential);
        for (const covered of covers[essential]) {
          remainingMinterms.delete(covered);
        }
      }
    }
  }

  if (essentials.length > 0) {
    steps.push({
      title: "Step 5: Select Essential Prime Implicants",
      details: `Prime Implicants that uniquely cover at least one minterm: [${essentials.join(', ')}].`
    });
  }

  let greedy: string[] = [];
  while (remainingMinterms.size > 0) {
    let bestImp = "";
    let bestCover = 0;
    for (const imp of implicantList) {
      if (finalImplicants.includes(imp)) continue;
      let coverCount = 0;
      for (const m of covers[imp]) {
        if (remainingMinterms.has(m)) coverCount++;
      }
      if (coverCount > bestCover) {
        bestCover = coverCount;
        bestImp = imp;
      }
    }
    finalImplicants.push(bestImp);
    greedy.push(bestImp);
    for (const covered of covers[bestImp]) {
      remainingMinterms.delete(covered);
    }
  }

  if (greedy.length > 0) {
    steps.push({
      title: "Step 6: Cover Remaining Minterms",
      details: `Selected additional Prime Implicants to cover the rest of the minterms: [${greedy.join(', ')}].`
    });
  }

  const vars = ['w', 'x', 'y', 'z'];
  const result = finalImplicants.map(imp => {
    let term = "";
    for (let i = 0; i < numVars; i++) {
      if (imp[i] === '1') term += vars[i];
      else if (imp[i] === '0') term += vars[i] + "'";
    }
    return term;
  }).join(' + ');

  steps.push({
    title: "Step 7: Final Simplified Expression",
    details: `Convert binary strings back to boolean variables: ${result}`
  });

  return { result, steps };
}
