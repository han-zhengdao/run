// 这是一个测试文件，用于验证文件路径引用格式的显示

// 正常的注释

// 文件路径引用格式示例：
// /C:/Users/admin/Desktop/run/src/pages/index/index.vue#L118-227

// 另一种格式：
// src/pages/index/index.vue:118-227

// 使用变量存储路径
const filePath = '/C:/Users/admin/Desktop/run/src/pages/index/index.vue#L118-227';

// 导出函数
export function openFile(path) {
  console.log(`Opening file: ${path}`);
  return path;
}