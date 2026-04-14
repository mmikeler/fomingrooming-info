import GetUserMediaFiles from "../actions/getUserMediaFiles";
import { FileGrid } from "./fileGrid";

export default async function UserMediaGallery() {
  const files = await GetUserMediaFiles();

  return (
    <div className="mx-auto w-full max-w-7xl p-6">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Мои файлы</h2>
        <p className="text-gray-600">Управляйте вашими загруженными файлами</p>
      </div>

      <FileGrid files={files} />
    </div>
  );
}
