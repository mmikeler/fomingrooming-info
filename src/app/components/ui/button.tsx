export default function Button(props: any) {
  return (
    <button
      role="button"
      {...props}
      className="btn px-3 py-4 lg:px-7.5 lg:py-5"
    >
      {props.children}
    </button>
  );
}
