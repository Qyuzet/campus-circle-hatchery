import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export default function Loading() {
  return (
    <DashboardLayout activeTab="my-ai" wishlistCount={0} notifications={[]}>
      <div className="space-y-0">
        <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex">
            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b-2 border-blue-600">
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b-2 border-transparent">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="mb-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-4 h-48 animate-pulse"
              >
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-3" />
                <div className="h-3 w-full bg-gray-200 rounded mb-2" />
                <div className="h-3 w-5/6 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-4/6 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
