import Carrousel from "./Carrousel";

export default function BookingCard() {
    return (
        <div className="bg-gray-50 rounded-lg border border-gray-300/20 shadow-sm p-6 flex flex-col gap-4">
            <Carrousel images={["https://placehold.co/600x400"]} />

            <section className="text-gray-700 text-sm leading-relaxed">
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Pariatur soluta voluptatem porro! Placeat reprehenderit quo ipsa amet tenetur nulla veritatis nostrum! Voluptatibus amet voluptas expedita aliquam, ad autem reprehenderit deserunt.
                </p>
            </section>

            <div className="flex justify-center gap-3">
                <button className="px-4 py-2 bg-white border border-gray-300/20 rounded-md text-gray-700 shadow-sm hover:bg-gray-100 transition">Confirm</button>
                <button className="px-4 py-2 bg-white border border-gray-300/20 rounded-md text-gray-700 shadow-sm hover:bg-gray-100 transition">Cancel</button>
            </div>
        </div>
    );
}