import MDEditor from "@uiw/react-md-editor";
import { getExcerpt } from "../ui/excerpt";
import { Button } from "antd";
import { useState } from "react";

/*
 * Компонент для отображения контента поста
 * Если контент длиннее MIN символов и isPreview = true, то отображает сокращенный контент с кнопкой "Развернуть"
 * Если контент длиннее MAX, то кнопка "Развернуть" не отображается
 * @param {boolean} isPreview - флаг, указывающий на предпросмотр контента
 * @param {string} content - контент поста (markdown)
 * @returns {JSX.Element} - компонент для отображения контента поста
 */
export default function PostContent({
  isPreview,
  content,
}: {
  isPreview: boolean;
  content: string;
}) {
  const MIN = 190;
  const MAX = 500;
  const length = content.length;
  const [contentLengthLimit, setContentLengthLimit] = useState(MIN);

  return (
    <div className="mt-4 text-[1rem]">
      {isPreview ? (
        <>
          <div className="">
            {getExcerpt(content, contentLengthLimit)}
            {length > MIN && length <= MAX && contentLengthLimit !== MAX && (
              <Button type="link" onClick={() => setContentLengthLimit(500)}>
                Развернуть
              </Button>
            )}
          </div>
        </>
      ) : (
        <MDEditor.Markdown source={content} />
      )}
    </div>
  );
}
