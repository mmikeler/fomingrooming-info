// Компонент для отображения поисковой строки

import Search from "antd/es/input/Search";
import { SearchIcon } from "lucide-react";

export function SearchPanel() {
  return (
    <>
      <div className="ms-8 w-fit lg:hidden">
        <SearchIcon color="white" />
      </div>
      <div className="hidden lg:block">
        <Search size="large" placeholder="Поиск..." />
      </div>
    </>
  );
}
