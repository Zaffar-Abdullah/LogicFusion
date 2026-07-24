export interface Step {
  expression: string;
  rule: string;
}

export function generateAlgebraicSteps(expression: string, vars: string[] = ['w', 'x', 'y', 'z']): Step[] {
  if (!expression.trim()) return [];
  let currentExpr = expression.toLowerCase().replace(/\s+/g, '');
  let terms = Array.from(new Set(currentExpr.split('+')));
  
  const steps: Step[] = [];
  steps.push({ expression: terms.join(' + '), rule: 'Original Expression' });

  let changed = true;
  while (changed) {
    changed = false;
    
    // 1. Try to combine adjacent terms: C*V' + C*V = C
    let mergedIdx1 = -1;
    let mergedIdx2 = -1;
    let newTerm = '';
    let commonPart = '';
    let diffVar = '';

    for (let i = 0; i < terms.length; i++) {
      for (let j = i + 1; j < terms.length; j++) {
        const t1 = terms[i];
        const t2 = terms[j];
        
        // Count differing literals
        const getLiterals = (t: string) => {
          let lits: Record<string, boolean> = {};
          for (const v of vars) {
            const idx = t.indexOf(v);
            if (idx !== -1) {
              lits[v] = t.charAt(idx + 1) === "'" ? false : true;
            }
          }
          return lits;
        };

        const l1 = getLiterals(t1);
        const l2 = getLiterals(t2);
        
        // Ensure they have the same variables
        const keys1 = Object.keys(l1);
        const keys2 = Object.keys(l2);
        if (keys1.length !== keys2.length || !keys1.every(k => keys2.includes(k))) continue;
        
        let diffCount = 0;
        let dVar = '';
        for (const k of keys1) {
          if (l1[k] !== l2[k]) {
            diffCount++;
            dVar = k;
          }
        }
        
        if (diffCount === 1) {
          mergedIdx1 = i;
          mergedIdx2 = j;
          diffVar = dVar;
          // Build common part
          for (const k of keys1) {
            if (k !== dVar) {
              commonPart += l1[k] ? k : k + "'";
              newTerm += l1[k] ? k : k + "'";
            }
          }
          if (newTerm === '') newTerm = '1';
          if (commonPart === '') commonPart = '1';
          break;
        }
      }
      if (mergedIdx1 !== -1) break;
    }

    if (mergedIdx1 !== -1) {
      // We found a merge!
      const unmerged = terms.filter((_, idx) => idx !== mergedIdx1 && idx !== mergedIdx2);
      
      const unmergedStr = unmerged.length > 0 ? unmerged.join(' + ') + ' + ' : '';
      
      if (commonPart === '1') {
        steps.push({ expression: `${unmergedStr}(${diffVar}' + ${diffVar})`, rule: `Factoring` });
        steps.push({ expression: `${unmergedStr}(1)`, rule: `${diffVar}' + ${diffVar} = 1 (Complement)` });
        steps.push({ expression: unmerged.length > 0 ? unmergedStr.slice(0, -3) + ' + 1' : '1', rule: `Identity` });
      } else {
        steps.push({ expression: `${unmergedStr}${commonPart}(${diffVar}' + ${diffVar})`, rule: `Factoring ${commonPart}` });
        steps.push({ expression: `${unmergedStr}${commonPart}(1)`, rule: `${diffVar}' + ${diffVar} = 1 (Complement)` });
        steps.push({ expression: `${unmergedStr}${commonPart}`, rule: `A.1 = A (Identity)` });
      }
      
      terms = unmerged;
      terms.push(newTerm);
      // Remove duplicates
      terms = Array.from(new Set(terms));
      changed = true;
      continue;
    }

    // 2. Try Absorption: A + AB = A
    let absorbedIdx = -1;
    let absorberIdx = -1;
    let absVar = '';

    for (let i = 0; i < terms.length; i++) {
      for (let j = 0; j < terms.length; j++) {
        if (i === j) continue;
        const t1 = terms[i];
        const t2 = terms[j]; // Try to absorb t2 into t1 (t1 + t1*X = t1)

        const l1 = getLiterals(t1);
        const l2 = getLiterals(t2);
        
        // t2 must contain all literals of t1
        const keys1 = Object.keys(l1);
        let containsAll = true;
        for (const k of keys1) {
          if (l2[k] !== l1[k]) {
            containsAll = false;
            break;
          }
        }
        
        if (containsAll) {
          // Find what's extra in t2
          const extra = Object.keys(l2).filter(k => !keys1.includes(k));
          let extraStr = '';
          for (const k of extra) {
            extraStr += l2[k] ? k : k + "'";
          }
          
          absorberIdx = i;
          absorbedIdx = j;
          absVar = extraStr;
          break;
        }
      }
      if (absorberIdx !== -1) break;
    }

    if (absorberIdx !== -1) {
      const absorber = terms[absorberIdx];
      const unmerged = terms.filter((_, idx) => idx !== absorberIdx && idx !== absorbedIdx);
      const unmergedStr = unmerged.length > 0 ? unmerged.join(' + ') + ' + ' : '';
      
      steps.push({ expression: `${unmergedStr}${absorber}(1 + ${absVar})`, rule: `Factoring ${absorber}` });
      steps.push({ expression: `${unmergedStr}${absorber}(1)`, rule: `1 + A = 1 (Null)` });
      steps.push({ expression: `${unmergedStr}${absorber}`, rule: `A.1 = A (Identity)` });
      
      terms = terms.filter((_, idx) => idx !== absorbedIdx);
      changed = true;
      continue;
    }
  }

  // Idempotent A + A = A is handled by Set
  return steps;
}

function getLiterals(t: string) {
  let lits: Record<string, boolean> = {};
  const vars = ['w', 'x', 'y', 'z'];
  for (const v of vars) {
    const idx = t.indexOf(v);
    if (idx !== -1) {
      lits[v] = t.charAt(idx + 1) === "'" ? false : true;
    }
  }
  return lits;
}
