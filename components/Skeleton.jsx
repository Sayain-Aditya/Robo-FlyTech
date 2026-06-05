export function ProductCardSkeleton() {
  return (
    <div className="classic-card overflow-hidden">
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="flex justify-between mt-3">
          <div className="skeleton h-5 w-20" />
          <div className="skeleton h-5 w-16" />
        </div>
        <div className="skeleton h-8 w-full mt-3" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 border-l-4 border-l-gray-200 p-5">
      <div className="skeleton h-3 w-24 mb-3" />
      <div className="skeleton h-8 w-20" />
    </div>
  );
}
