export interface Review {
    id:             number;
    content:        string | null;
    rating:         number;
    reviewer_id:    number;
    reviewed_id:    number;
    appointment_id: number;
    created_at:     string;

    // Join with User
    reviewer_name?: string; 
}

export interface Badge {
    id:   number;
    name: string;
}

export interface UserBadge {
    user_id:  number;
    badge_id: number;

    // Join with badge
    name:     string; 
}