import sys

with open('src/components/VirtualEmbeddedLab.tsx', 'r') as f:
    content = f.read()

content = content.replace("from './ArduinoWorkspace';", "from './embedded/ArduinoWorkspace';")
content = content.replace("from './ArduinoEditor';", "from './embedded/ArduinoEditor';")
content = content.replace("from './ArduinoMonitors';", "from './embedded/ArduinoMonitors';")
content = content.replace("from './ArduinoEngine';", "from './embedded/ArduinoEngine';")

with open('src/components/VirtualEmbeddedLab.tsx', 'w') as f:
    f.write(content)

