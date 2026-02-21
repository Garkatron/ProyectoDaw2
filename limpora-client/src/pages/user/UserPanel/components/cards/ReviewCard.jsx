export default function ReviewCard({ review }) {
  const reviewerName = review?.reviewer || 'Anónimo';
  const rating = Number(review?.rating || 0);
  const text = review?.text || '';

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300/20 space-y-2">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-700 flex-shrink-0">
          {reviewerName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-grow flex justify-between items-center">
          <p className="text-sm font-medium text-gray-800">
            {reviewerName}
          </p>

          <p className="text-sm text-yellow-500 flex-shrink-0">
            {'★'.repeat(rating)}
            {'☆'.repeat(5 - rating)}
          </p>
        </div>
      </div>

      {text && (
        <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3 pt-1">
          "{text}"
        </p>
      )}
    </div>
  );
}