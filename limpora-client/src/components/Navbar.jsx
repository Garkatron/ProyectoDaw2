import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-gray-300/20 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-gray-800 font-semibold text-lg">
          Panel
        </div>

        <ul className="flex gap-6 text-gray-700">
          <li>
            <Link
              to="/me"
              className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Me
            </Link>
          </li>

          <li>
            <Link
              to="/currency"
              className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Currency
            </Link>
          </li>

          <li>
            <Link
              to="/booking"
              className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Booking
            </Link>
          </li>

          <li>
            <Link
              to="/top"
              className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Top Users
            </Link>
          </li>

          <li>
            <Link
              to="/reviews"
              className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Reviews
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
