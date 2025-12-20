"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Space, Spin } from "antd";
import Avatar from "antd/es/avatar/Avatar";
import Title from "antd/es/typography/Title";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) router.push("/auth/signin");
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!session) {
    return null; // Redirecting
  }

  return (
    <div className="mx-auto">
      <Space orientation="vertical" size={"large"}>
        <Avatar size={100} style={{ backgroundColor: "var(--foreground)" }}>
          <Title
            style={{
              margin: 0,
              color: "var(--background)",
            }}
          >
            {session.user.name && session.user.name[0]}
          </Title>
        </Avatar>
        <Title editable={true}>{session.user.name}</Title>
      </Space>
    </div>
  );
}
