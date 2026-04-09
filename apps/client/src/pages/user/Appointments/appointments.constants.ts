import { AppointmentStatus } from "@limpora/common";
import { CheckCircle, Clock, RefreshCw } from "lucide-react";

export const STATUS_CONFIG = {
    [AppointmentStatus.Completed]: {
        color: "green",
        icon: CheckCircle,
    },
    [AppointmentStatus.Pending]: {
        color: "yellow",
        icon: Clock,
    },
    [AppointmentStatus.InProcess]: {
        color: "blue",
        icon: RefreshCw,
    },
    [AppointmentStatus.Cancelled]: {
        color: "red",
        icon: Clock,
    },
};

export const NEXT_STATUSES_PROVIDER: Partial<
    Record<AppointmentStatus, AppointmentStatus[]>
> = {
    [AppointmentStatus.Pending]: [
        AppointmentStatus.InProcess,
        AppointmentStatus.Cancelled,
    ],
    [AppointmentStatus.InProcess]: [
        AppointmentStatus.Completed,
        AppointmentStatus.Cancelled,
    ],
    [AppointmentStatus.PendingPayment]: [AppointmentStatus.Cancelled],
};

export const NEXT_STATUSES_CLIENT: Partial<
    Record<AppointmentStatus, AppointmentStatus[]>
> = {
    [AppointmentStatus.Pending]: [AppointmentStatus.Cancelled],
    [AppointmentStatus.PendingPayment]: [AppointmentStatus.Cancelled],
};
