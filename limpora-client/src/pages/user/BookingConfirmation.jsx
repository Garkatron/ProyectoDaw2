import Calendar from "../../components/Calendar";
import Finder from "../../components/Finder";
import { UserCard } from "../../components/UserCard";
import UserInfoSidePanel from "../../components/UserInfoSidePanel";
import Base from "../../layouts/Base";

export default function BookingConfirmation({ }) {
    return (
        <Base>
            <div className="">
                <Calendar />
                <UserInfoSidePanel />
            </div>
        </Base>
    );
}