export function UserCard({ user }) {
    return (
        <div className="bg-white border border-gray-300/20 shadow-sm rounded-lg p-4 flex items-center gap-4 text-gray-800 hover:shadow-md transition">
            <img
                src=""
                alt={user.name}
                className="w-14 h-14 rounded-md bg-gray-100 border border-gray-300/20 object-cover"
            />
            <span className="text-gray-700 font-medium">{user.name}</span>
        </div>
    );
}