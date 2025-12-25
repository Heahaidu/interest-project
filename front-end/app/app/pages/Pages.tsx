'use client';

import { useState, useEffect } from 'react';
import axios, { endpoints, authApis } from '@/lib/APIs';
import PageDetail from './PageDetail';
import CreatePageDialog from './CreatePageDialog';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

interface PageProps {
  pageId?: string;
}

interface Page {
  uuid: string;
  name: string;
  pageType: string;
  description: string;
  followerCount: number;
  coverImageUrl: string;
  avatarUrl: string;
  followed?: boolean;
}

export default function PageList({ pageId }: PageProps) {
  const { user } = useContext(AuthContext);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const [myPages, setMyPages] = useState<Page[]>([]);
  const [loadingMyPages, setLoadingMyPages] = useState(false);
  const [myPageNumber, setMyPageNumber] = useState(0);
  const [myTotalPages, setMyTotalPages] = useState(1);

  const [nomPages, setNomPages] = useState<Page[]>([]);
  const [loadingNomPages, setLoadingNomPages] = useState(false);
  const [nomPageNumber, setNomPageNumber] = useState(0);
  const [nomTotalPages, setNomTotalPages] = useState(1);

  const PAGE_SIZE = 5;

  const fetchMyPages = async (page: number = 0) => {
    setLoadingMyPages(true);
    try {
      const res = await authApis().get(endpoints['pages-owner'], {
        params: { page, size: PAGE_SIZE },
        headers: {
          "X-User-Email": user?.email,
        },
      },);

      const pages: Page[] = res.data.content.map((p: any) => ({
        ...p,
      }));

      setMyPages(pages);
      setMyTotalPages(res.data.totalPages);
      setMyPageNumber(res.data.number);
    } catch (error) {
      console.error("Failed to fetch my pages", error);
    } finally {
      setLoadingMyPages(false);
    }
  };

  const fetchPages = async (page: number) => {
    setLoadingNomPages(true);
    try {
      const res = await axios.get(endpoints.pages, {
        params: { page, size: PAGE_SIZE },
      });

      const pages: Page[] = res.data.content.map((p: any) => ({
        ...p,
        followed: p.followed ?? false,
      }));

      setNomPages(pages);
      setNomTotalPages(res.data.totalPages);
      setNomPageNumber(res.data.number);
    } catch (error) {
      console.error("Failed to fetch pages", error);
    } finally {
      setLoadingNomPages(false);
    }
  };

  useEffect(() => {
    fetchPages(0);
    fetchMyPages();
  }, []);

  const handleNext = () => {
    if (nomPageNumber + 1 < nomTotalPages) fetchPages(nomPageNumber + 1);
  };

  const handlePrev = () => {
    if (nomPageNumber > 0) fetchPages(nomPageNumber - 1);
  };

  const toggleFollow = async (page: Page, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const url = page.followed
        ? endpoints['page-follower-update'](page.uuid)
        : endpoints['page-follower-delete'](page.uuid);

      await authApis().post(url);

      setMyPages(prev =>
        prev.map(p =>
          p.uuid === page.uuid
            ? {
                ...p,
                followed: !p.followed,
                followerCount: p.followed
                  ? p.followerCount - 1
                  : p.followerCount + 1,
              }
            : p
        )
      );
    } catch (err) {
      console.error("Follow failed", err);
    }
  };

  // Nếu đã chọn 1 page thì render PageDetail thay cho danh sách
  if (selectedPageId) {
    return (
      <PageDetail pageId={selectedPageId} onBack={() => setSelectedPageId(null)} />
    );
  }

  // Danh sách page hiển thị mặc định
  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">My Pages</h2>
        
        {/* chỉ cần component CreatePageDialog, nó đã bao gồm nút "Create a page" */}
        <CreatePageDialog
          onCreated={(newPage) => {
            // cập nhật lại danh sách sau khi tạo page
            fetchMyPages(); 
          }}
        />
      </div>

      <div>
        {loadingMyPages ? (
        <p>Loading pages...</p>
      ) : myPages.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
            {myPages.map(page => (
              <div
                key={page.uuid}
                onClick={() => setSelectedPageId(page.uuid)} 
                className="p-4 border rounded shadow-sm bg-white dark:bg-[#111] cursor-pointer hover:shadow-md transition"
              >
                <img
                  src={page.coverImageUrl}
                  alt="Cover"
                  className="w-full h-32 object-cover rounded mb-2"
                />

                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={page.avatarUrl}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900"
                  />
                  <h4 className="font-medium">{page.name}</h4>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {page.description}
                </p>

                <p className="text-xs text-gray-400 mb-2">
                  Followers: {page.followerCount}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrev}
              disabled={myPageNumber === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {myPageNumber + 1} of {myTotalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={myPageNumber + 1 >= myTotalPages}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p>You don't have your own page yet.</p>
      )}
      </div>

      <div className="h-16"></div>

      <h2 className="text-lg font-semibold mb-4">Nomination Pages</h2>
      {loadingNomPages ? (
        <p>Loading pages...</p>
      ) : nomPages.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
            {nomPages.map(page => (
              <div
                key={page.uuid}
                onClick={() => setSelectedPageId(page.uuid)} 
                className="p-4 border rounded shadow-sm bg-white dark:bg-[#111] cursor-pointer hover:shadow-md transition"
              >
                <img
                  src={page.coverImageUrl}
                  alt="Cover"
                  className="w-full h-32 object-cover rounded mb-2"
                />

                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={page.avatarUrl}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900"
                  />
                  <h4 className="font-medium">{page.name}</h4>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {page.description}
                </p>

                <p className="text-xs text-gray-400 mb-2">
                  Followers: {page.followerCount}
                </p>

                <button
                  onClick={(e) => toggleFollow(page, e)}
                  className={`px-3 py-1 rounded text-sm ${
                    page.followed
                      ? "bg-red-500 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {page.followed ? "Unfollow" : "Follow"}
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrev}
              disabled={nomPageNumber === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {nomPageNumber + 1} of {nomTotalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={nomPageNumber + 1 >= nomTotalPages}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p>There are no recommended pages.</p>
      )}
    </div>
  );
}
