"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Config, OAuthList, OAuthName, Auth } from "@vkid/sdk";
import { exchangeVKCode } from "../actions/exchangeVKCode";
import type { ExchangeVKCodeResult } from "../actions/exchangeVKCode";
import { Spin } from "antd";

const APP_ID = 54610790;

export function VK_Auth() {
  const router = useRouter();
  const initialized = useRef(false);
  const searchParams = useSearchParams();
  const [waiting, setWaiting] = useState(false);

  const handleVKError = useCallback((error: unknown) => {
    console.error("VK Auth Error:", JSON.stringify(error, null, 2));
  }, []);

  const handleLoginSuccess = useCallback(
    async (payload: { code: string; device_id: string }) => {
      setWaiting(true);

      const { code, device_id: deviceId } = payload;

      const res = await Auth.exchangeCode(code, deviceId);

      if (!res.access_token) {
        return;
      }

      try {
        const result: ExchangeVKCodeResult = await exchangeVKCode(
          res.access_token,
          res.user_id.toString(),
        );

        if (result.action === "login") {
          // Пользователь существует — выполняем вход через VK провайдер
          const signInResult = await signIn("vk", {
            slug: result.slug,
            callbackUrl: result.redirectTo,
            redirect: false,
          });

          if (signInResult?.ok) {
            router.push(result.redirectTo);
          } else {
            console.error("SignIn failed after VK login", signInResult);
          }
        } else if (result.action === "register") {
          // Новый пользователь — редирект на регистрацию
          const params = new URLSearchParams();
          params.set("provider", "vk");
          params.set("vkUserId", String(result.vkUserId));
          params.set("name", result.name);
          if (result.avatar) params.set("avatar", result.avatar);
          if (result.city) params.set("city", result.city);

          router.push(`/auth/signup?${params.toString()}`);
        }
      } catch (error) {
        console.error("VK exchangeVKCode error:", error);
        handleVKError(error);
      } finally {
        setWaiting(false);
      }
    },
    [router, handleVKError],
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    Config.init({
      app: APP_ID,
      redirectUrl: `${window.location.origin}/auth/signin`,
      scope: "email,phone,avatar,city",
    });

    const oAuth = new OAuthList();

    oAuth.render({
      container: document.getElementById("vk-auth-container")!,
      oauthList: [OAuthName.VK],
    });
  }, [handleLoginSuccess, handleVKError]);

  useEffect(() => {
    if (searchParams.get("code")) {
      const code = searchParams.get("code");
      const deviceId = searchParams.get("device_id");

      if (code && deviceId) {
        handleLoginSuccess({ code, device_id: deviceId });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {waiting && <Spin fullscreen />}
      <div id="vk-auth-container" />
    </>
  );
}
