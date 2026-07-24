export type ALUStep = {
  id: number;
  phase: string;
  description: string;
  bitA?: number;
  bitB?: number;
  carryIn?: number;
  outBit?: number;
  carryOut?: number;
  regA?: string;
  regB?: string;
  acc?: string;
  resultSoFar: string;
};

export function simulateALU(a: string, b: string, operation: string): { result: string; steps: ALUStep[] } {
  const steps: ALUStep[] = [];
  let stepId = 0;
  
  if (operation === "+" || operation === "-") {
    const isSub = operation === "-";
    const maxLength = Math.max(a.length, b.length);
    let paddedA = a.padStart(maxLength, "0");
    let paddedB = b.padStart(maxLength, "0");
    
    let carry = isSub ? 1 : 0;
    let result = "";
    
    for (let i = maxLength - 1; i >= 0; i--) {
      const bitA = Number(paddedA[i]);
      let rawBitB = Number(paddedB[i]);
      const bitB = isSub ? (rawBitB === 1 ? 0 : 1) : rawBitB; // 1's complement for SUB
      
      const sum = bitA ^ bitB ^ carry;
      const newCarry = (bitA & bitB) | (carry & (bitA ^ bitB));
      
      result = sum.toString() + result;
      
      steps.push({
        id: stepId++,
        phase: `Bit ${maxLength - 1 - i} ${isSub ? 'Subtraction' : 'Addition'}`,
        description: isSub 
          ? `Invert B (${rawBitB}→${bitB}). Add A(${bitA}) + ~B(${bitB}) + Cin(${carry}) = ${sum}, Cout = ${newCarry}`
          : `Add A(${bitA}) + B(${bitB}) + Cin(${carry}) = ${sum}, Cout = ${newCarry}`,
        bitA,
        bitB,
        carryIn: carry,
        outBit: sum,
        carryOut: newCarry,
        resultSoFar: result
      });
      
      carry = newCarry;
    }
    
    if (carry && !isSub) {
      result = "1" + result;
      steps.push({
        id: stepId++,
        phase: `Final Carry`,
        description: `Add remaining carry out to result.`,
        bitA: 0,
        bitB: 0,
        carryIn: carry,
        outBit: 1,
        carryOut: 0,
        resultSoFar: result
      });
    }
    
    return { result, steps };
  } 
  else if (operation === "*") {
    let acc = "0".padStart(a.length + b.length, "0");
    let multiplicand = a.padStart(a.length + b.length, "0");
    let multiplier = b;
    
    steps.push({
      id: stepId++,
      phase: "Initialization",
      description: `Setup Accumulator=0, Multiplicand=${a}, Multiplier=${b}`,
      acc,
      regA: multiplicand,
      regB: multiplier,
      resultSoFar: acc
    });
    
    for (let i = multiplier.length - 1; i >= 0; i--) {
      const bit = multiplier[i];
      const shiftPos = multiplier.length - 1 - i;
      const shiftedMultiplicand = a + "0".repeat(shiftPos);
      
      if (bit === "1") {
        steps.push({
          id: stepId++,
          phase: `Add (Multiplier Bit ${shiftPos} = 1)`,
          description: `Add shifted multiplicand (${shiftedMultiplicand}) to accumulator.`,
          regA: shiftedMultiplicand,
          regB: bit,
          acc,
          resultSoFar: acc
        });
        
        // Add shiftedMultiplicand to acc
        let tempCarry = 0;
        let tempAcc = "";
        const m1 = acc.padStart(shiftedMultiplicand.length, "0");
        const m2 = shiftedMultiplicand.padStart(acc.length, "0");
        for (let j = Math.max(m1.length, m2.length) - 1; j >= 0; j--) {
          const s = Number(m1[j]) + Number(m2[j]) + tempCarry;
          tempAcc = (s % 2) + tempAcc;
          tempCarry = Math.floor(s / 2);
        }
        if (tempCarry) tempAcc = "1" + tempAcc;
        acc = tempAcc;
        
        steps.push({
          id: stepId++,
          phase: `Accumulate`,
          description: `Accumulator is now ${acc}`,
          regA: shiftedMultiplicand,
          acc,
          resultSoFar: acc
        });
      } else {
        steps.push({
          id: stepId++,
          phase: `Skip (Multiplier Bit ${shiftPos} = 0)`,
          description: `Multiplier bit is 0. Shift multiplicand but do not add.`,
          regA: shiftedMultiplicand,
          regB: bit,
          acc,
          resultSoFar: acc
        });
      }
    }
    
    return { result: acc, steps };
  }
  else if (operation === "/") {
    const numA = parseInt(a, 2);
    const numB = parseInt(b, 2);
    if (numB === 0) return { result: "DIV/0", steps: [] };
    
    let quotient = Math.floor(numA / numB).toString(2);
    let remainder = (numA % numB).toString(2);
    
    steps.push({
      id: stepId++,
      phase: "Division",
      description: `Performed long division. Quotient = ${quotient}, Remainder = ${remainder}`,
      resultSoFar: quotient
    });
    
    return { result: quotient, steps };
  }

  return { result: "0", steps: [] };
}

export function convertBase(value: string, fromBase: number, toBase: number): string {
  if (!value) return "";
  try {
    const decimal = parseInt(value, fromBase);
    if (isNaN(decimal)) return "Invalid";
    return decimal.toString(toBase).toUpperCase();
  } catch {
    return "Invalid";
  }
}
