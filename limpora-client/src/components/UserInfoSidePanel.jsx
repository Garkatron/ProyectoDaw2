
export default function UserInfoSidePanel({ }) {
    return (<div className="lg:col-span-2 flex flex-col gap-6 w-full">
        <div className="bg-white border border-gray-300/20 shadow-md rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <img
                src=""
                alt="Selected User"
                className="w-28 h-28 rounded-lg bg-gray-100 border border-gray-300/20 object-cover"
            />
   
        </div>

        <div className="bg-white border border-gray-300/20 shadow-md rounded-lg p-6 text-gray-700">
            Additional user info goes here...
        </div>
    </div>);
}