import * as path from 'path';
import * as fs from 'fs';
import { config } from 'dotenv';

// 加载环境变量
config();

function replaceFilesForProduction() {
  const env = process.env['NODE_ENV'] || 'development';

  console.log(`Current NODE_ENV: ${process.env['NODE_ENV']}`);

  if (env === 'production') {
    const sourceFile = path.join(
      path.resolve('./src/environments'),
      'environment.prod.ts',
    );
    const targetFile = path.join(
      path.resolve('./src/environments'),
      'environment.ts',
    );

    fs.copyFileSync(sourceFile, targetFile);
    console.log(`Replaced environment file with ${sourceFile}`);
  } else {
    console.log('Development build, no file replacement necessary.');
  }
}

replaceFilesForProduction();
