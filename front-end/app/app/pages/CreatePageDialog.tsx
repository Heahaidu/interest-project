import { useState, useContext } from "react";
import axios, { endpoints, authApis } from '@/lib/APIs';
import { AuthContext } from '@/context/AuthContext';

export default function CreatePageDialog({ onCreated }: { onCreated?: (page: any) => void }) {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [pageName, setPageName] = useState("");
  const [description, setDescription] = useState("");
  const [pageType, setPageType] = useState<"PERSONAL" | "ORGANIZATION" | "BUSINESS" | "COMMUNITY">("PERSONAL");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pageName) return alert("Please enter a page name");

    setLoading(true);
    try {
        // gọi API tạo page
        const res = await authApis().post(
          endpoints["page-update"],
          {
            name: pageName,
            description,
            pageType,
            avatarUrl,
            coverImageUrl,
          },
          {
            headers: {
              "X-User-Email": user?.email,
            },
          }
        );


        const newPage = res.data;

        alert("Page created successfully!");
        setOpen(false);
        setPageName("");
        setDescription("");
        setAvatarUrl("");
        setCoverImageUrl("");
        setPageType("PERSONAL");

        if (onCreated) onCreated(newPage); // cập nhật list page nếu cần
    } catch (err) {
        console.error(err);
        alert("Failed to create page");
    } finally {
        setLoading(false);
    }
  };


  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Create a page
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Create a Page</h3>

            <input
              type="text"
              placeholder="Page Name"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            />
            <select
              value={pageType}
              onChange={(e) => setPageType(e.target.value as any)}
              className="w-full mb-2 p-2 border rounded"
            >
              <option value="PERSONAL">Personal</option>
              <option value="ORGANIZATION">Organization</option>
              <option value="BUSINESS">Business</option>
              <option value="COMMUNITY">Community</option>
            </select>
            <input
              type="text"
              placeholder="Avatar URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Cover Image URL"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
