
import { useEffect, useState } from "react";
import Base from "../../layouts/Base";
import { getUserEarnings } from "../../services/earnings.service";

function UserInfoDisplay({ earnings }) {
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
                <StatCard label="Citas cerradas" value={earnings?.closed_appointments || 0} />
                <StatCard label="Citas canceladas" value={earnings?.cancelled_appointments || 0} />
                <StatCard label="Dinero total" value={`$${earnings?.total_money || 0}`} />
                <StatCard label="Dinero retenido" value={`$${earnings?.retained_money || 0}`} />
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

function Appointment({ date, requesterName, totalPrice, status }) {
    const stateColor = status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
    const formattedDate = new Date(date).toLocaleDateString();
    
    return (
        <div className={`flex justify-between items-center p-4 rounded-xl shadow-sm ${stateColor}`}>
            <div className="flex flex-col">
                <span className="font-semibold">{requesterName}</span>
                <span className="text-sm text-gray-500">{formattedDate}</span>
            </div>
            <div className="text-gray-900 font-bold">${totalPrice}</div>
        </div>
    );
}

function UserAppointmentsClosedList({ appointments }) {
    return (
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col h-full gap-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Appointments</h3>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                {appointments && appointments.length > 0 ? (
                    appointments.map((appt) => (
                        <Appointment 
                            key={appt.id} 
                            date={appt.date_time}
                            requesterName={appt.requester_name}
                            totalPrice={appt.total_amount}
                            status={appt.status}
                        />
                    ))
                ) : (
                    <p className="text-gray-500 text-center">No appointments yet</p>
                )}
            </div>
        </div>
    );
}

export default function Currency() {
    const [data, setData] = useState({ earnings: null, appointments: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = 1; // Get from auth context
                const result = await getUserEarnings(userId);
                setData({
                    earnings: result.earnings,
                    appointments: result.appointments
                });
            } catch (error) {
                console.error("Error fetching earnings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Base>
                <div className="flex items-center justify-center h-full">
                    <p>Loading...</p>
                </div>
            </Base>
        );
    }

    return (
        <Base>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 h-full">
                <UserInfoDisplay earnings={data.earnings} />
                <UserAppointmentsClosedList appointments={data.appointments} />
            </div>
        </Base>
    );
}