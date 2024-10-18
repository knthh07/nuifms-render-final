import React from 'react';
import SideNav from '../Components/sidenav/SideNav';
import ViewUserFeedback from '../Components/ViewUserFeedback';

const Feedback = () => {
    return (
        <div>
            <SideNav />
            <div>
                <ViewUserFeedback />
            </div>
        </div>
    );
};

export default Feedback;
