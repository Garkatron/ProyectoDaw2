import Base from "../../layouts/Base";

function UserInfoDisplay() {
    return (
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col md:flex-col h-full gap-6">
            <div className="flex justify-center md:justify-start">
                <img
                    src="https://placehold.co/300x300"
                    alt="User"
                    className="w-32 h-32 rounded-full object-cover"
                />
            </div>

            <div className="flex flex-col gap-4 flex-1">
                <StatCard label="Citas cerradas" value="0" />
                <StatCard label="Citas canceladas" value="0" />
                <StatCard label="Dinero total" value="$0" />
                <StatCard label="Dinero retenido" value="$0" />
            </div>
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center shadow-sm flex-1">
            <div className="text-gray-400 text-sm">{label}</div>
            <div className="text-gray-900 font-bold text-lg">{value}</div>
        </div>
    );
}

function Appointment({ date, requesterName, totalPrice, state }) {
    const stateColor = state === "closed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
    return (
        <div className={`flex justify-between items-center p-4 rounded-xl shadow-sm ${stateColor}`}>
            <div className="flex flex-col">
                <span className="font-semibold">{requesterName}</span>
                <span className="text-sm text-gray-500">{date}</span>
            </div>
            <div className="text-gray-900 font-bold">${totalPrice}</div>
        </div>
    );
}

function UserAppointmentsClosedList() {
    const appointments = [
        { date: "2025-12-01", requesterName: "Juan Perez", totalPrice: 50, state: "open" },
        { date: "2025-12-02", requesterName: "Maria Lopez", totalPrice: 75, state: "closed" },
        { date: "2025-12-03", requesterName: "Carlos Diaz", totalPrice: 100, state: "closed" },
    ];

    return (
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col h-full gap-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Appointments</h3>
            <div className="flex flex-col gap-3 flex-1">
                {appointments.map((appt, index) => (
                    <Appointment key={index} {...appt} />
                ))}
            </div>
        </div>
    );
}

export default function Currency() {
    return (
        <Base>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 h-full">
                <UserInfoDisplay />
                <UserAppointmentsClosedList />
            </div>
        </Base>
    );
}
