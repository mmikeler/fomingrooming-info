import { Button as B } from "antd";

export default function Button(props: any) {
  return (
    <button role="button" {...props} className="btn">
      {props.children}
    </button>
  );
}
