const cp = require('child_process');

function runCommand(cmd) {
  console.log(`=== start executing: ${cmd}`);
  cp.execSync(cmd, { stdio: 'inherit' });
  console.log(`=== finish executing: ${cmd}`);
}

function runScript(scriptName, pkgLocation) {
  const pkgJson = require(`${pkgLocation}/package.json`);
  // 检查是否存在对应脚本
  if (pkgJson.scripts && pkgJson.scripts[scriptName]) {
    runCommand(`cd ${pkgLocation} && cnpm run ${scriptName}`);
  }
}

const lerna = {
  changed() {
    return JSON.parse(cp.execSync('lerna changed --json'));
  },
  list() {
    return JSON.parse(cp.execSync('lerna list --json --toposort'));
  },
};

// 重新装一下依赖，干净一点
runCommand('lerna clean --yes');
runCommand('lerna bootstrap');

const changedPackages = lerna.changed();

changedPackages.forEach((pkg) => {
  // 不理会 private 项目
  if (pkg.private) {
    return;
  }
  
//   runScript('lint', pkg.location);
//   runScript('build', pkg.location);
//   runScript('test', pkg.location);
});

runCommand('lerna version --allow-branch master');

changedPackages.forEach((pkg) => {
  if (pkg.private) {
    return;
  }
  
  runCommand(`cd ${pkg.location} && ytnpm publish`);
});