"use client";

import { FeedItem } from "@/app/in/lenta/actions/getFeedItem";
import { Flex, Space, Tooltip } from "antd";
import { EventTypeTag } from "../events/EventTypeTag";
import EventFormatTag from "../events/EventFormarTag";
import EventStatusTag from "../events/EventStatusTag";
import EventRegTag from "../events/EventRegistrationsTag";
import { useSession } from "next-auth/react";
import { eventDatesRange, formatEventDate } from "../ui/date";
import { ChevronsRight, Play, Square, Timer } from "lucide-react";
import EventPlaceTag from "../events/EventPlaceTag";
import { RegisterButton } from "../events/EventRegisterButton";

export default function PostMeta({ post }: { post: FeedItem }) {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  if (post.type === "EVENT") {
    const isEnded = post.endDate ? new Date(post.endDate) < new Date() : false;
    return (
      <div className="mt-5 pb-3">
        <Flex gap={8} wrap align="center">
          <EventFormatTag event={post} />
          <EventTypeTag type={post.eventType || "VEBINAR"} />
          <EventStatusTag event={post} />
          <div className="ms-auto flex gap-4">
            <EventRegTag event={post} />
            <RegisterButton
              eventId={post.id}
              isRegistered={post.isRegistered || false}
              isLoggedIn={isLoggedIn}
              isAuthor={post.isAuthor}
              isEnded={isEnded}
            />
          </div>
        </Flex>

        {/* Опциональный раздел с локацией */}
        {post.location && (
          <div className="mt-4 font-semibold">
            <EventPlaceTag event={post} />
          </div>
        )}

        {/* Опциональный раздел с датами */}
        <div className="mt-4 flex flex-wrap items-center justify-around border-y border-stone-200 bg-stone-50 py-2 font-semibold">
          <Tooltip title="Дата начала">
            <Space>
              <span>
                <Play color="green" size={16} />
              </span>
              <span>
                {post.startDate
                  ? formatEventDate(post.startDate)
                  : "Не указано"}
              </span>
            </Space>
          </Tooltip>
          <ChevronsRight color="lightgray" />
          <Tooltip title="Продолжительность">
            <Space>
              <span>
                <Timer color="blue" size={16} />
              </span>
              <span>
                {post.startDate && post.endDate
                  ? eventDatesRange(post.startDate, post.endDate)
                  : "Не указано"}
              </span>
            </Space>
          </Tooltip>
          <ChevronsRight color="lightgray" />
          <Tooltip title="Окончание">
            <Space>
              <span>
                <Square color="red" size={16} />
              </span>
              <span>
                {post.endDate ? formatEventDate(post.endDate) : "Не указано"}
              </span>
            </Space>
          </Tooltip>
        </div>
      </div>
    );
  }
}
