import { useState } from 'react';
import BookingCard from '../components/BookingCard';
import Base from '../layouts/Base';
import Calendar from './../components/Calendar';
import Finder from './../components/Finder';
import { UserCard } from './../components/UserCard';


export function UserFinder() {
    return (
        <Base>
            <input type="text" />
           <Finder data={[{name: "asdsad"}]} CardType={UserCard} />
        </Base>
    );
}