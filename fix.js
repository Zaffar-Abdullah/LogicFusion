const fs = require('fs');
let content = fs.readFileSync('src/components/BooleanSimplifier.tsx', 'utf8');
content = content.replace('          </div>\n        </div>\n      </div>\n    </div>\n  );\n}', '          </div>\n        </div>\n        </div>\n      </div>\n    </div>\n  );\n}');
fs.writeFileSync('src/components/BooleanSimplifier.tsx', content);
