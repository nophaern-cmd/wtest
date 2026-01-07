/**
 * 将本地图片引用转换为CDN引用
 * 使用方法: node scripts/convert-to-cdn.js
 */

const fs = require('fs');
const path = require('path');

// CDN配置路径
const CDN_CONFIG_PATH = path.join(__dirname, '../images/cdn-config.js');

// 需要处理的文件
const FILES_TO_CONVERT = [
  '../pages/mode1/mode1.js',
  '../pages/mode2/mode2.js',
  '../pages/mode3/mode3.js',
  '../pages/mode3-detail/mode3-detail.js',
  '../pages/game/game.js',
  '../data/stories.js'
].map(p => path.join(__dirname, p));

/**
 * 检查CDN配置是否存在
 */
function checkCDNConfig() {
  if (!fs.existsSync(CDN_CONFIG_PATH)) {
    console.error('❌ 错误: CDN配置文件不存在');
    console.log(`请先运行: node scripts/upload_images.js`);
    console.log(`然后将图片上传到云存储，并修改 ${CDN_CONFIG_PATH} 中的 baseUrl`);
    return false;
  }
  return true;
}

/**
 * 转换图片路径为CDN URL
 */
function convertImageToCDN(imagePath) {
  // 匹配 /images/xxx/yyy.png 格式
  const match = imagePath.match(/\/images\/([^\/]+)\/([^.]+)\.(png|jpg|jpeg)/i);

  if (!match) return null;

  const category = match[1];
  const name = match[2];

  return `getImageUrl('${category}', '${name}')`;
}

/**
 * 转换单个文件
 */
function convertFile(filePath) {
  console.log(`\n处理: ${path.relative(__dirname, filePath)}`);

  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 匹配 require('../../images/xxx/yyy.png') 或 require('/images/xxx/yyy.png')
  const pattern = /require\(['"]([\/\.\.]*images\/[^'"]+)['"]\)/g;

  const newContent = content.replace(pattern, (match, imagePath) => {
    const cdnCall = convertImageToCDN(imagePath);

    if (cdnCall) {
      console.log(`  转换: ${match} → ${cdnCall}`);
      modified = true;
      return `require('${CDN_CONFIG_PATH.replace(path.join(__dirname, '..'), '.')}').${cdnCall}`;
    }

    return match;
  });

  if (modified) {
    // 添加 CDN 配置的 require（如果不存在）
    const cdnRequire = `const cdnConfig = require('${path.relative(path.dirname(filePath), CDN_CONFIG_PATH)}');`;

    if (!newContent.includes('cdnConfig') && !newContent.includes('require(\'../../images/cdn-config\')')) {
      const firstRequireMatch = newContent.match(/^(const\s+\w+\s*=\s*)?require\(/m);
      if (firstRequireMatch) {
        // 在第一个 require 前添加
        const modifiedContent = newContent.replace(/^(const\s+\w+\s*=\s*)?require\(/m, `${cdnRequire}\n$&`);
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
      } else {
        // 在文件开头添加
        const modifiedContent = `${cdnRequire}\n\n${newContent}`;
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
      }
    } else {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }

    console.log('  ✓ 已保存');
    return true;
  }

  console.log('  无需修改');
  return false;
}

/**
 * 主函数
 */
function main() {
  console.log('=== 图片路径转CDN工具 ===\n');

  if (!checkCDNConfig()) {
    process.exit(1);
  }

  let convertedCount = 0;

  FILES_TO_CONVERT.forEach(file => {
    if (fs.existsSync(file)) {
      if (convertFile(file)) {
        convertedCount++;
      }
    } else {
      console.log(`\n跳过（文件不存在）: ${file}`);
    }
  });

  console.log('\n=== 完成 ===');
  console.log(`共转换 ${convertedCount} 个文件`);
  console.log('\n请确认:');
  console.log('1. 所有图片已上传到云存储');
  console.log(`2. ${CDN_CONFIG_PATH} 中的 baseUrl 已正确配置`);
  console.log('3. 测试应用确保图片正常显示');
}

main();
