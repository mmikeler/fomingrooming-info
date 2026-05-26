// НЕ ИСПОЛЬЗУЕТСЯ. Оставлено как пример

export async function vkAuthInit() {
if ("VKIDSDK" in window) {
      const VKID = window.VKIDSDK;

      VKID.Config.init({
        app: 51878823,
        redirectUrl: "http://localhost/api/auth/callback/vk",
        responseMode: VKID.ConfigResponseMode.Callback,
        source: VKID.ConfigSource.LOWCODE,
        scope: "", // Заполните нужными доступами по необходимости
      });

      const oneTap = new VKID.OneTap();

      oneTap
        .render({
          container: document.currentScript.parentElement,
          showAlternativeLogin: true,
        })
        .on(VKID.WidgetEvents.ERROR, vkidOnError)
        .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, function (payload) {
          const code = payload.code;
          const deviceId = payload.device_id;

          VKID.Auth.exchangeCode(code, deviceId)
            .then(vkidOnSuccess)
            .catch(vkidOnError);
        });

      function vkidOnSuccess(data) {
        // Обработка полученного результата
      }

      function vkidOnError(error) {
        // Обработка ошибки
      }
    }}