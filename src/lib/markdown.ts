export function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/\*(.*?)\*/g, "$1") // Italic
    .replace(/~~(.*?)~~/g, "$1") // Strikethrough
    .replace(/`(.*?)`/g, "$1") // Inline code
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Links
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, "$1") // Images
    .replace(/^#+\s*/gm, "") // Headers
    .trim();
}
