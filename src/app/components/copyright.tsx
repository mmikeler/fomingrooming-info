export function Copyright() {
  return (
    <>
      <div className="">© ИП Иванов И.И. {new Date().getFullYear()}</div>
      <div className="">
        Версия: {process.env.NEXT_PUBLIC_APP_VERSION || "-"}
      </div>
    </>
  );
}
