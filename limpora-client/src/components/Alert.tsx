
import {

  XMarkIcon, ExclamationCircleIcon, CheckCircleIcon

} from "@heroicons/react/24/outline";

export default function Alert ({ type, message, onClose })  {
  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800"
  };

  const icons = {
    success: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    error: <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
  };

  return (
    <div className={`flex items-start space-x-3 p-4 rounded-lg border ${styles[type]} mb-4`}>
      {icons[type]}
      <div className="flex-grow">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};