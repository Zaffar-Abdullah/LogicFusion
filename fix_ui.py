import sys

with open('src/components/BooleanSimplifier.tsx', 'r') as f:
    content = f.read()

# Add import
import_line = "import { generateAlgebraicSteps } from '../logic/algebraicSimplifier';\n"
content = content.replace("import { quineMcCluskey, getMintermsFromSOP } from '../logic/quineMcCluskey';", "import { quineMcCluskey, getMintermsFromSOP } from '../logic/quineMcCluskey';\n" + import_line)

# Update useMemo
old_usememo = """  const { simplified, steps, truthTable, error } = useMemo(() => {
    try {
      const minterms = getMintermsFromSOP(expression);
      const qmResult = quineMcCluskey(minterms);
      const truthTable = generateTruthTable(['w', 'x', 'y', 'z'], minterms);
      return { simplified: qmResult.result, steps: qmResult.steps, truthTable, error: null };
    } catch (err: any) {
      return { simplified: "", steps: [], truthTable: [], error: err.message };
    }
  }, [expression]);"""

new_usememo = """  const { simplified, algebraicSteps, truthTable, error } = useMemo(() => {
    try {
      const minterms = getMintermsFromSOP(expression);
      const qmResult = quineMcCluskey(minterms);
      const truthTable = generateTruthTable(['w', 'x', 'y', 'z'], minterms);
      const algSteps = generateAlgebraicSteps(expression, ['w', 'x', 'y', 'z']);
      return { simplified: qmResult.result, algebraicSteps: algSteps, truthTable, error: null };
    } catch (err: any) {
      return { simplified: "", algebraicSteps: [], truthTable: [], error: err.message };
    }
  }, [expression]);"""

content = content.replace(old_usememo, new_usememo)

# Update the rendering of steps
old_render_steps = """            <h3 className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-4">Step-by-Step Mathematical Simplification</h3>
            <div className="space-y-4">
              {steps.map((step: any, index: number) => (
                <div key={index} className="border-l-2 border-indigo-500 pl-4 py-1">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{step.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800">
                    {step.details}
                  </p>
                </div>
              ))}
            </div>"""

new_render_steps = """            <h3 className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-4">Step-by-Step Mathematical Simplification</h3>
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5 font-mono text-sm shadow-sm overflow-x-auto">
              <div className="flex items-start text-indigo-600 dark:text-indigo-400 mb-2">
                <span className="w-8 font-semibold">F =</span>
                <span className="flex-1">{algebraicSteps.length > 0 ? algebraicSteps[0].expression : expression}</span>
              </div>
              
              {algebraicSteps.slice(1).map((step: any, index: number) => (
                <div key={index} className="flex items-start mb-2 group">
                  <span className="w-8 text-slate-400 dark:text-slate-500">=</span>
                  <span className="flex-1 text-slate-800 dark:text-slate-200">{step.expression}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 ml-4 border-l border-slate-200 dark:border-slate-700 pl-4 py-0.5 group-hover:text-indigo-500 transition-colors whitespace-nowrap">
                    | {step.rule}
                  </span>
                </div>
              ))}
              {algebraicSteps.length === 0 && (
                <div className="text-slate-500 text-xs italic">Expression is already fully simplified or cannot be parsed.</div>
              )}
            </div>"""

content = content.replace(old_render_steps, new_render_steps)

with open('src/components/BooleanSimplifier.tsx', 'w') as f:
    f.write(content)

