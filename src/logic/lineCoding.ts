export type LineCodingScheme =
  | 'Unipolar NRZ'
  | 'Polar NRZ-L'
  | 'Polar NRZ-I'
  | 'RZ'
  | 'Manchester'
  | 'Differential Manchester'
  | 'AMI'
  | 'Pseudoternary'
  | 'MLT-3'
  | '2B1Q';

export interface AnalysisData {
  bandwidth: string;
  dcComponent: string;
  selfClocking: string;
  errorDetection: string;
  transitions: number;
  powerSpectral: string;
}

export function analyzeScheme(scheme: LineCodingScheme, transitions: number): AnalysisData {
  switch (scheme) {
    case 'Unipolar NRZ':
      return {
        bandwidth: 'Average N/2, Max N',
        dcComponent: 'Yes (High)',
        selfClocking: 'No',
        errorDetection: 'None',
        transitions,
        powerSpectral: 'High power around DC (0 frequency).'
      };
    case 'Polar NRZ-L':
      return {
        bandwidth: 'Average N/2, Max N',
        dcComponent: 'Yes (Moderate)',
        selfClocking: 'No',
        errorDetection: 'None',
        transitions,
        powerSpectral: 'High power around DC, but less than unipolar.'
      };
    case 'Polar NRZ-I':
      return {
        bandwidth: 'Average N/2, Max N',
        dcComponent: 'Yes',
        selfClocking: 'No',
        errorDetection: 'None',
        transitions,
        powerSpectral: 'High power around DC.'
      };
    case 'RZ':
      return {
        bandwidth: 'Average N, Max 2N',
        dcComponent: 'Yes',
        selfClocking: 'Yes',
        errorDetection: 'None',
        transitions,
        powerSpectral: 'More power spread, larger bandwidth required.'
      };
    case 'Manchester':
      return {
        bandwidth: 'Average N, Max 2N',
        dcComponent: 'No',
        selfClocking: 'Yes',
        errorDetection: 'None',
        transitions,
        powerSpectral: 'Power concentrated around N/2. No DC component.'
      };
    case 'Differential Manchester':
      return {
        bandwidth: 'Average N, Max 2N',
        dcComponent: 'No',
        selfClocking: 'Yes',
        errorDetection: 'None',
        transitions,
        powerSpectral: 'Power concentrated around N/2. No DC component.'
      };
    case 'AMI':
      return {
        bandwidth: 'Average N/2, Max N',
        dcComponent: 'No',
        selfClocking: 'No (fails on long 0s)',
        errorDetection: 'Yes (violation detection)',
        transitions,
        powerSpectral: 'Zero power at DC. Concentrated around N/2.'
      };
    case 'Pseudoternary':
      return {
        bandwidth: 'Average N/2, Max N',
        dcComponent: 'No',
        selfClocking: 'No (fails on long 1s)',
        errorDetection: 'Yes (violation detection)',
        transitions,
        powerSpectral: 'Zero power at DC. Concentrated around N/2.'
      };
    case 'MLT-3':
      return {
        bandwidth: 'Average N/3, Max N/2',
        dcComponent: 'No',
        selfClocking: 'No',
        errorDetection: 'None',
        transitions,
        powerSpectral: 'Very low bandwidth. Power concentrated around N/4.'
      };
    case '2B1Q':
      return {
        bandwidth: 'Average N/4',
        dcComponent: 'Yes',
        selfClocking: 'No',
        errorDetection: 'None',
        transitions,
        powerSpectral: 'Very low bandwidth. High DC component.'
      };
    default:
      return {
        bandwidth: 'N/A',
        dcComponent: 'N/A',
        selfClocking: 'N/A',
        errorDetection: 'N/A',
        transitions,
        powerSpectral: 'N/A'
      };
  }
}

export function encodeSignal(binaryStr: string, scheme: LineCodingScheme): { levels: number[][], analysis: AnalysisData } {
  const levels: number[][] = []; // Array of [v1, v2] for each bit
  let transitionsCount = 0;
  
  let currentLevel = 1;
  let lastNonZero = -1; // For MLT-3

  const paddedStr = scheme === '2B1Q' && binaryStr.length % 2 !== 0 ? binaryStr + '0' : binaryStr;
  
  let prevV = scheme === 'Polar NRZ-I' || scheme === 'Differential Manchester' ? 1 : 0;
  if (scheme === 'Differential Manchester') prevV = 1; // start high conventionally

  for (let i = 0; i < paddedStr.length; i++) {
    const bit = paddedStr[i];
    let v1 = 0, v2 = 0;

    switch (scheme) {
      case 'Unipolar NRZ':
        v1 = v2 = bit === '1' ? 1 : 0;
        break;
      case 'Polar NRZ-L':
        // 0 -> +1, 1 -> -1 (Standard)
        v1 = v2 = bit === '0' ? 1 : -1;
        break;
      case 'Polar NRZ-I':
        // Invert on 1
        if (bit === '1') {
          prevV = -prevV;
        }
        v1 = v2 = prevV;
        break;
      case 'RZ':
        if (bit === '1') {
          v1 = 1; v2 = 0;
        } else {
          v1 = -1; v2 = 0;
        }
        break;
      case 'Manchester':
        // IEEE standard: 0 = high-to-low (+1 to -1), 1 = low-to-high (-1 to +1)
        if (bit === '0') {
          v1 = 1; v2 = -1;
        } else {
          v1 = -1; v2 = 1;
        }
        break;
      case 'Differential Manchester':
        // 0 = transition at start, 1 = no transition at start. Both transition in middle.
        if (bit === '0') {
          prevV = -prevV;
        }
        v1 = prevV;
        v2 = -prevV;
        prevV = v2;
        break;
      case 'AMI':
        if (bit === '0') {
          v1 = v2 = 0;
        } else {
          v1 = v2 = currentLevel;
          currentLevel = -currentLevel;
        }
        break;
      case 'Pseudoternary':
        if (bit === '1') {
          v1 = v2 = 0;
        } else {
          v1 = v2 = currentLevel;
          currentLevel = -currentLevel;
        }
        break;
      case 'MLT-3':
        // 0: no change. 1: transition to next level (0, 1, 0, -1 sequence)
        if (bit === '1') {
          if (currentLevel !== 0) {
            lastNonZero = currentLevel;
            currentLevel = 0;
          } else {
            currentLevel = -lastNonZero;
          }
        }
        v1 = v2 = currentLevel;
        break;
      case '2B1Q':
        // Read 2 bits
        const nextBit = paddedStr[i + 1];
        const dibit = bit + nextBit;
        if (dibit === '00') v1 = v2 = -3;
        else if (dibit === '01') v1 = v2 = -1;
        else if (dibit === '10') v1 = v2 = 3;
        else if (dibit === '11') v1 = v2 = 1;
        levels.push([v1, v2]);
        i++; // skip next bit
        continue;
    }
    levels.push([v1, v2]);
  }

  // Count transitions
  let currentVolt = levels[0][0];
  for (let i = 0; i < levels.length; i++) {
    if (levels[i][0] !== currentVolt) {
      transitionsCount++;
      currentVolt = levels[i][0];
    }
    if (levels[i][1] !== currentVolt) {
      transitionsCount++;
      currentVolt = levels[i][1];
    }
  }

  return { levels, analysis: analyzeScheme(scheme, transitionsCount) };
}
