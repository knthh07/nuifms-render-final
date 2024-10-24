import React from 'react';
import UserSideNav from '../Components/user_sidenav/UserSideNav';
import JobOrderForm from '../Components/formsComponents/jobOrderForm';

const UserApplication = () => {
    return (
        <div>
            <UserSideNav />
            <div>
                <JobOrderForm />
            </div>
        </div>
    );
};

export default UserApplication;
