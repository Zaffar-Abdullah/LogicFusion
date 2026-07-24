import sys

with open('src/components/VirtualEmbeddedLab.tsx', 'r') as f:
    content = f.read()

# Make it fill parent correctly
content = content.replace(
    '<div className="flex h-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">', 
    '<div className="absolute inset-0 flex bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">'
)

with open('src/components/VirtualEmbeddedLab.tsx', 'w') as f:
    f.write(content)
