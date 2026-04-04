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

export const NEXT_STATUSES: Record<string, AppointmentStatus[]> = {
  [AppointmentStatus.PendingPayment]: [
    AppointmentStatus.Pending,
    AppointmentStatus.Cancelled,
  ],
  [AppointmentStatus.Pending]: [
    AppointmentStatus.InProcess,
    AppointmentStatus.Cancelled,
  ],
  [AppointmentStatus.InProcess]: [
    AppointmentStatus.Completed,
    AppointmentStatus.Cancelled,
  ],
  [AppointmentStatus.Completed]: [],
  [AppointmentStatus.Cancelled]: [],
};