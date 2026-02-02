import { z } from "zod";
import type { Theme } from "./types";

// 颜色验证正则
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// 标题样式 schema
const headingStyleSchema = z.object({
  color: z.string().regex(hexColorRegex, "无效的颜色格式"),
  fontSize: z.string().min(1),
  fontWeight: z.string().min(1),
  lineHeight: z.string().min(1),
  marginTop: z.string().min(1),
  marginBottom: z.string().min(1),
  borderBottom: z.string().optional(),
  paddingBottom: z.string().optional(),
});

// 段落样式 schema
const paragraphStyleSchema = z.object({
  color: z.string().regex(hexColorRegex, "无效的颜色格式"),
  fontSize: z.string().min(1),
  lineHeight: z.string().min(1),
  marginBottom: z.string().min(1),
});

// 链接样式 schema
const linkStyleSchema = z.object({
  color: z.string().regex(hexColorRegex, "无效的颜色格式"),
  textDecoration: z.string().min(1),
});

// 引用样式 schema
const blockquoteStyleSchema = z.object({
  background: z.string().min(1),
  borderLeft: z.string().min(1),
  color: z.string().regex(hexColorRegex, "无效的颜色格式"),
  padding: z.string().min(1),
  margin: z.string().min(1),
  fontStyle: z.string().min(1),
});

// 代码样式 schema
const codeStyleSchema = z.object({
  background: z.string().min(1),
  color: z.string().min(1),
  padding: z.string().min(1),
  borderRadius: z.string().min(1),
  fontFamily: z.string().min(1),
  fontSize: z.string().min(1),
});

// 代码块样式 schema
const codeBlockStyleSchema = z.object({
  background: z.string().min(1),
  color: z.string().min(1),
  padding: z.string().min(1),
  borderRadius: z.string().min(1),
  fontFamily: z.string().min(1),
  fontSize: z.string().min(1),
  lineHeight: z.string().min(1),
  overflow: z.string().min(1),
});

// 列表样式 schema
const listStyleSchema = z.object({
  color: z.string().regex(hexColorRegex, "无效的颜色格式"),
  marginLeft: z.string().min(1),
  marginBottom: z.string().min(1),
  lineHeight: z.string().min(1),
});

// 表格样式 schema
const tableStyleSchema = z.object({
  borderColor: z.string().min(1),
  headerBackground: z.string().min(1),
  headerColor: z.string().min(1),
  cellPadding: z.string().min(1),
  evenRowBackground: z.string().optional(),
});

// 图片样式 schema
const imageStyleSchema = z.object({
  maxWidth: z.string().min(1),
  borderRadius: z.string().min(1),
  margin: z.string().min(1),
});

// 分割线样式 schema
const hrStyleSchema = z.object({
  border: z.string().min(1),
  margin: z.string().min(1),
});

// 主题样式 schema
const themeStylesSchema = z.object({
  background: z.string().regex(hexColorRegex, "无效的背景色格式"),
  text: z.string().regex(hexColorRegex, "无效的文字颜色格式"),
  textSecondary: z.string().min(1),
  h1: headingStyleSchema,
  h2: headingStyleSchema,
  h3: headingStyleSchema,
  h4: headingStyleSchema,
  h5: headingStyleSchema,
  h6: headingStyleSchema,
  paragraph: paragraphStyleSchema,
  link: linkStyleSchema,
  blockquote: blockquoteStyleSchema,
  code: codeStyleSchema,
  codeBlock: codeBlockStyleSchema,
  list: listStyleSchema,
  table: tableStyleSchema,
  image: imageStyleSchema,
  hr: hrStyleSchema,
});

// 完整主题 schema
export const themeSchema = z.object({
  id: z.string().min(1, "主题 ID 不能为空"),
  name: z.string().min(1, "主题名称不能为空"),
  description: z.string(),
  isBuiltIn: z.boolean(),
  styles: themeStylesSchema,
});

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 验证主题配置
 * @param theme - 要验证的主题对象
 * @returns 验证结果
 */
export function validateTheme(theme: unknown): ValidationResult {
  const result = themeSchema.safeParse(theme);

  if (result.success) {
    return { valid: true, errors: [] };
  }

  const errors = result.error.issues.map((err) => {
    const path = err.path.join(".");
    return `${path}: ${err.message}`;
  });

  return { valid: false, errors };
}

/**
 * 验证主题是否有效
 * @param theme - 要验证的主题对象
 * @returns 是否有效
 */
export function isValidTheme(theme: unknown): theme is Theme {
  return validateTheme(theme).valid;
}

/**
 * 验证颜色格式
 * @param color - 颜色字符串
 * @returns 是否为有效的十六进制颜色
 */
export function isValidHexColor(color: string): boolean {
  return hexColorRegex.test(color);
}
