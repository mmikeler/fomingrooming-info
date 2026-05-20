"use client";
// Компонент для загрузки контента страницы

import MDEditor from "@uiw/react-md-editor";

export default function MDContent({ content }: { content: string }) {
  return <MDEditor.Markdown source={content} />;
}
