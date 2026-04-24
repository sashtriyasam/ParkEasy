const fs = require('fs');
let content = fs.readFileSync('qa_e2e_api.js', 'utf8');

content = content.replace("const axios = require('axios');", "const axios = require('axios');\nconst api = axios.create({ timeout: 10000 });");

content = content.replace(/axios\.post/g, 'api.post');
content = content.replace(/axios\.get/g, 'api.get');
content = content.replace(/axios\.delete/g, 'api.delete');
content = content.replace(/axios\.put/g, 'api.put');
content = content.replace(/axios\.patch/g, 'api.patch');

fs.writeFileSync('qa_e2e_api.js', content);
