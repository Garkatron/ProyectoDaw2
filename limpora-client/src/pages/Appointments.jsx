import BookingCard from "../components/BookingCard";
import Calendar from "../components/Calendar";
import Base from "../layouts/Base";

export default function Appointments() {
    return (
        <Base>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start p-4">

                <div className="flex justify-center md:justify-end w-full">
                    <div className="w-full max-w-md">
                        <BookingCard />
                    </div>
                </div>

                <div className="flex flex-col w-full">
                    <h3 className="text-xl font-semibold mb-6 text-gray-800">
                        Appointments
                    </h3>

                    <div className="flex justify-center md:justify-start w-full">
                        <div className="w-full max-w-md">
                            <Calendar />
                        </div>
                    </div>
                </div>
            </div>
        </Base>
    );
}
