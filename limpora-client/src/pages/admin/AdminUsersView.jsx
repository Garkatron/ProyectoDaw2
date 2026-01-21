import UserInfoSidePanel from '../../components/UserInfoSidePanel';
import Finder from './../../components/Finder';
import { UserCard } from './../../components/UserCard';

export default function AdminUsersView() {
    const placeholder = [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center p-6 sm:p-10">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                <div className="lg:col-span-1 w-full">
                    <div className="bg-white border border-gray-300/20 shadow-md rounded-lg p-6">
                        <Finder data={placeholder} CardType={UserCard} />
                    </div>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-6">
                    <UserInfoSidePanel />

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button className="px-6 py-2 bg-gray-100 text-gray-700 border border-gray-300/20 rounded-md shadow-sm hover:bg-gray-200 transition w-full sm:w-auto">
                            Confirm
                        </button>
                        <button className="px-6 py-2 bg-gray-100 text-gray-700 border border-gray-300/20 rounded-md shadow-sm hover:bg-gray-200 transition w-full sm:w-auto">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
