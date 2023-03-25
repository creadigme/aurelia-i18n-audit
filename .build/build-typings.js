const path = require('path');
const fs = require('fs');
const packageJson = require(path.join(__dirname, '../package.json'));
const bundleDtsPath = path.join(__dirname, '../dist/bundle.d.ts');

let bundleDts = fs.readFileSync(bundleDtsPath, { encoding: 'utf-8' });
bundleDts += `\ndeclare module "${packageJson.name}" {
    export * from "${bundleDts.indexOf('declare module "index"') !== -1 ? 'index' : 'src/index'}";
}
`;

fs.writeFileSync(bundleDtsPath, bundleDts, { encoding: 'utf-8' });
