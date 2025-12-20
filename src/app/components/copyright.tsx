import pkg from "../../../package.json";

export function Copyright() {
  return (
    <span>
      © Фомингруминг Инфо {new Date().getFullYear()} {pkg.version}
    </span>
  );
}
