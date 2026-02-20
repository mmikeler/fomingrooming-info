import pkg from "../../../package.json";

export function Copyright() {
  return (
    <span>
      © ИП Иванов ИИ {new Date().getFullYear()} {pkg.version}
    </span>
  );
}
