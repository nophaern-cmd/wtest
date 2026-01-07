/**
 * 批量上传图片到云存储并生成CDN URL映射
 * 使用前请确保：
 * 1. 已配置云开发环境
 * 2. 在 project.config.json 中配置了 cloudfunctionRoot
 * 3. 已安装 wx-server-sdk
 */

const fs = require('fs');
const path = require('path');

// 本地图片目录
const IMAGE_DIR = path.join(__dirname, '../images');
// 输出的配置文件路径
const CONFIG_OUTPUT = path.join(IMAGE_DIR, 'cdn-config.js');

// 云存储URL模板 (替换为你的云存储环境ID)
// 格式: https://your-env-id-xxxx.tcb.qcloud.la/路径
const CLOUD_BASE_URL = 'cloud://你的云环境ID.你的云环境ID/images';

// 图片分类目录
const CATEGORIES = [
  'letters', 'animals', 'colors', 'food', 'body-people',
  'actions', 'numbers', 'objects', 'weather', 'scenes', 'icons'
];

/**
 * 扫描本地图片文件
 */
function scanImages() {
  const imageMap = {};

  CATEGORIES.forEach(category => {
    const categoryPath = path.join(IMAGE_DIR, category);
    if (fs.existsSync(categoryPath)) {
      const files = fs.readdirSync(categoryPath)
        .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

      imageMap[category] = files.map(file => ({
        filename: file,
        cloudPath: `images/${category}/${file}`,
        localPath: path.join(categoryPath, file),
        cdnUrl: `${CLOUD_BASE_URL}/${category}/${file}`
      }));
    }
  });

  return imageMap;
}

/**
 * 生成云存储上传清单文件
 */
function generateUploadList(imageMap) {
  const uploadList = [];

  Object.keys(imageMap).forEach(category => {
    imageMap[category].forEach(img => {
      uploadList.push({
        localPath: img.localPath,
        cloudPath: img.cloudPath,
        cdnUrl: img.cdnUrl
      });
    });
  });

  return uploadList;
}

/**
 * 生成CDN配置文件
 */
function generateCDNConfig(imageMap) {
  const config = `// CDN配置文件 - 自动生成
// 上传时间: ${new Date().toLocaleString('zh-CN')}

module.exports = {
  // CDN基础URL (替换为你的实际云存储URL)
  baseUrl: '${CLOUD_BASE_URL}',

  // 图片映射
  ${Object.keys(imageMap).map(category => {
    const files = imageMap[category];
    return `  // ${category}
  ${category}: {
${files.map(f => `    '${f.filename.replace(/\.(png|jpg|jpeg)$/, '')}': '${f.cdnUrl}'`).join(',\n')}
  }`;
  }).join(',\n\n')},

  // 获取图片URL的辅助函数
  getImageUrl(category, name) {
    if (this[category] && this[category][name]) {
      return this[category][name];
    }
    console.warn(\`图片不存在: \${category}/\${name}\`);
    return '';
  }
};

module.exports.default = module.exports;
`;

  fs.writeFileSync(CONFIG_OUTPUT, config);
  console.log(`✓ CDN配置已生成: ${CONFIG_OUTPUT}`);
}

/**
 * 生成上传说明文件
 */
function generateUploadInstructions(uploadList) {
  const instructions = `# 图片上传到云存储说明

## 方法一：使用微信开发者工具

1. 打开微信开发者工具
2. 点击左侧"云开发"按钮
3. 在云存储中创建以下目录结构:
   ${CATEGORIES.map(c => `   - images/${c}`).join('\n')}
4. 依次上传以下文件:

${uploadList.map(item => `  ${item.localPath} → ${item.cloudPath}`).join('\n')}

## 方法二：使用云函数批量上传

1. 创建云函数 \`upload-images\`
2. 将 uploadList 复制到云函数中
3. 调用云函数批量上传

## 方法三：使用腾讯云 COS CMD 工具

\`\`\`bash
# 安装 coscli
brew install coscli

# 配置
coscli config

# 批量上传
${uploadList.map(item => `coscli cp ${item.localPath} cos://你的存储桶/images/`).join('\n')}
\`\`\`

## 上传完成后

1. 替换 \`cdn-config.js\` 中的 baseUrl 为实际的云存储URL
2. 在代码中使用: \`require('../../images/cdn-config').getImageUrl('letters', 'a')\`

总文件数: ${uploadList.length}
`;

  fs.writeFileSync(path.join(__dirname, 'upload-instructions.md'), instructions);
  console.log('✓ 上传说明已生成');
}

// 主函数
function main() {
  console.log('开始扫描图片...\n');

  const imageMap = scanImages();
  const uploadList = generateUploadList(imageMap);

  console.log(`共扫描到 ${uploadList.length} 张图片\n`);

  generateCDNConfig(imageMap);
  generateUploadInstructions(uploadList);

  console.log('\n✓ 完成！请查看以下文件:');
  console.log(`  1. ${CONFIG_OUTPUT} - CDN配置文件`);
  console.log(`  2. ${path.join(__dirname, 'upload-instructions.md')} - 上传说明`);
  console.log('\n下一步: 将图片上传到云存储，然后替换baseUrl');
}

main();
