// Элементы авторизации Вконтакте, ОТКЛЮЧЕНО

import Script from "next/script";
import { useEffect } from "react";
import "./vkAuthInit";

export function VK_Auth() {
  useEffect(() => {}, []);

  return (
    <div id="vk-auth">
      <Script
        nonce="csp_nonce"
        src="https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js"
      />
    </div>
  );
}
