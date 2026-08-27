/**
 * Таблица транслитерации кириллицы в латиницу
 */
const TRANSLITERATION_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

/**
 * Транслитерация строки с кириллицей в латиницу
 */
function transliterate(str: string): string {
  return str
    .toLowerCase()
    .split("")
    .map((char) => {
      // Проверяем кириллицу
      if (TRANSLITERATION_MAP[char] !== undefined) {
        return TRANSLITERATION_MAP[char];
      }
      // Проверяем заглавную кириллицу
      const lowerChar = char.toLowerCase();
      if (TRANSLITERATION_MAP[lowerChar] !== undefined) {
        return TRANSLITERATION_MAP[lowerChar];
      }
      return char;
    })
    .join("");
}

/**
 * Преобразует строку в slug
 * - Транслитерирует кириллицу
 * - Приводит к нижнему регистру
 * - Заменяет пробелы и спецсимволы на дефисы
 * - Удаляет повторяющиеся дефисы
 * - Удаляет дефисы в начале и конце
 *
 * @param title - Заголовок для преобразования
 * @returns Slug строка
 */
export function slugify(title: string): string {
  // Транслитерация
  let slug = transliterate(title);

  // Приводим к нижнему регистру
  slug = slug.toLowerCase();

  // Заменяем всё кроме латинских букв, цифр и дефисов на дефис
  slug = slug.replace(/[^a-z0-9-]/g, "-");

  // Удаляем повторяющиеся дефисы
  slug = slug.replace(/-+/g, "-");

  // Удаляем дефисы в начале и конце
  slug = slug.replace(/^-+|-+$/g, "");

  // Ограничиваем длину (оставляем разумный максимум)
  if (slug.length > 200) {
    slug = slug.substring(0, 200).replace(/-+$/, "");
  }

  return slug;
}

/**
 * Проверяет валидность формата slug
 * - Длина от 3 до 200 символов
 * - Только латинские буквы, цифры и дефисы
 * - Не начинается и не заканчивается дефисом
 *
 * @param slug - Slug для проверки
 * @returns true если slug валиден
 */
export function validateSlug(slug: string): boolean {
  if (slug.length < 3 || slug.length > 200) {
    return false;
  }

  // Только латинские буквы, цифры и дефисы
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return false;
  }

  // Не должен начинаться или заканчиваться дефисом
  if (slug.startsWith("-") || slug.endsWith("-")) {
    return false;
  }

  // Не должен содержать повторяющиеся дефисы
  if (slug.includes("--")) {
    return false;
  }

  return true;
}
