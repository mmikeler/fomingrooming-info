"use client";

import { ADV_PLACES } from "@/generated/prisma/enums";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import getAdvData from "./getAdvData";
import { ADV } from "@/generated/prisma/client";
import { SETTINGS } from "@/app/admin/reklama/settings/components/settings";

/**
 * Компонент для отображения рекламного баннера с ротацией.
 *
 * @param props - Пропсы компонента.
 * @param props.place - Рекламное место (из перечисления ADV_PLACES).
 * @param props.className - CSS-класс для стилизации контейнера баннера.
 * @returns JSX-элемент рекламного баннера или `null`, если данных нет.
 */
export default function ADS({
  place,
  className,
}: {
  place: ADV_PLACES;
  className: string;
}) {
  const [ADVData, setADVData] = useState<ADV[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const ROTATE_TIME = 3000;

  // Получение данных рекламного места
  const getData = async () => {
    setLoading(true);
    try {
      getAdvData(place).then((data) => {
        if (data) {
          setADVData(data);
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Ротация баннеров
  const rotate = () => {
    if (ADVData.length > 1) {
      setTimeout(() => {
        setCount((prev) => {
          if (count === ADVData.length - 1) {
            return 0;
          }
          return prev + 1;
        });
      }, ROTATE_TIME);
    }
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    rotate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ADVData, count]);

  const adv = ADVData[count];

  if (loading || !adv) {
    return <div className="pulse bg-gray-300"></div>;
  }

  if (ADVData.length === 0) return null;

  const size = SETTINGS[place].size.split("x");
  const mobileSize = SETTINGS[place].mobileSize.split("x");
  const hasMobileSrc = adv && !!adv.mobileSrc;

  // Обработка нажатия на рекламу
  const onHandleClick = (event: React.MouseEvent) => {
    if (!adv.url) {
      event.preventDefault();
    }
    // TODO: Добавить обработку клика
    alert("Click to banner");
  };

  return (
    <div id={place.toLowerCase()} className={className}>
      <Link
        href={adv?.url}
        onClick={(e) => onHandleClick(e)}
        className="relative block h-full w-full rounded-lg bg-rose-100"
      >
        <Image
          className="hidden lg:block"
          src={adv?.src}
          alt=""
          fill
          sizes={`${size[0]}px ${size[1]}px`}
          unoptimized
          style={{ objectFit: "cover" }}
        />
        <Image
          className="lg:hidden"
          src={hasMobileSrc ? adv.mobileSrc : adv.src}
          alt=""
          fill
          sizes={`${mobileSize[0]}px ${mobileSize[1]}px`}
          unoptimized
          style={{ objectFit: "cover" }}
        />
      </Link>
    </div>
  );
}
