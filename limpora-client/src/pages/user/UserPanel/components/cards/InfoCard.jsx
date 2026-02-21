export default function InfoCard({ label, value }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300/20">
            <p className="text-xs font-light text-gray-500 uppercase">{label}</p>
            <p className="text-base font-medium text-gray-800">{value}</p>
        </div>
    );
}