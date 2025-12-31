export default function Loading() {
  return (
    <div className="space-y-6 p-4">
      <div className="h-12 bg-gray-200 animate-pulse rounded-lg w-64" />
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}

