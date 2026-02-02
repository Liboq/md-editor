/**
 * 主题类型定义
 */

export interface HeadingStyle {
  color: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  marginTop: string;
  marginBottom: string;
  borderBottom?: string;
  paddingBottom?: string;
}

export interface ParagraphStyle {
  color: string;
  fontSize: string;
  lineHeight: string;
  marginBottom: string;
}

export interface LinkStyle {
  color: string;
  textDecoration: string;
}

export interface BlockquoteStyle {
  background: string;
  borderLeft: string;
  color: string;
  padding: string;
  margin: string;
  fontStyle: string;
}

export interface CodeStyle {
  background: string;
  color: string;
  padding: string;
  borderRadius: string;
  fontFamily: string;
  fontSize: string;
}

export interface CodeBlockStyle {
  background: string;
  color: string;
  padding: string;
  borderRadius: string;
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  overflow: string;
}

export interface ListStyle {
  color: string;
  marginLeft: string;
  marginBottom: string;
  lineHeight: string;
}

export interface TableStyle {
  borderColor: string;
  headerBackground: string;
  headerColor: string;
  cellPadding: string;
  evenRowBackground?: string;
}

export interface ImageStyle {
  maxWidth: string;
  borderRadius: string;
  margin: string;
}

export interface HrStyle {
  border: string;
  margin: string;
}

export interface ThemeStyles {
  // 基础样式
  background: string;
  text: string;
  textSecondary: string;

  // 标题样式
  h1: HeadingStyle;
  h2: HeadingStyle;
  h3: HeadingStyle;
  h4: HeadingStyle;
  h5: HeadingStyle;
  h6: HeadingStyle;

  // 内容样式
  paragraph: ParagraphStyle;
  link: LinkStyle;
  blockquote: BlockquoteStyle;
  code: CodeStyle;
  codeBlock: CodeBlockStyle;
  list: ListStyle;
  table: TableStyle;
  image: ImageStyle;
  hr: HrStyle;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  isBuiltIn: boolean;
  styles: ThemeStyles;
  /** 自定义 CSS（可选，用于完全自定义样式） */
  customCSS?: string;
}
