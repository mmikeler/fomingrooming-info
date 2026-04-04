"use client";

import MDEditor from "@uiw/react-md-editor";

export default function Content(props: { content: string }) {
  return (
    <div>
      <MDEditor.Markdown source={props.content} />
    </div>
  );
}
