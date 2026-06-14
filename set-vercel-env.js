const { execSync } = require('child_process');
const fs = require('fs');

if (!fs.existsSync('.env.local')) {
  console.error('.env.local not found');
  process.exit(1);
}

const envFile = fs.readFileSync('.env.local', 'utf8');
const envs = envFile.split('\n')
  .filter(line => line.trim() && !line.startsWith('#'))
  .map(line => {
    const [name, ...rest] = line.split('=');
    return { name: name.trim(), value: rest.join('=').trim() };
  });

for (const env of envs) {
  if (!env.name || !env.value) continue;
  console.log(`Setting ${env.name}...`);
  try {
    execSync(`npx vercel env rm ${env.name} production -y`, { stdio: 'ignore' });
  } catch (e) {} // ignore if it doesn't exist
  
  try {
    // We pipe the value to the vercel env add command
    execSync(`node -e "process.stdout.write('${env.value}')" | npx vercel env add ${env.name} production`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed to set ${env.name}`, e.message);
  }
}
