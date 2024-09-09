import React from 'react';
import { FaSearch, FaUserCircle } from "react-icons/fa";

const TopPanel = () => {
    return (
        <div className="w-[77%] p-4 rounded-lg flex justify-between items-center bg-white shadow-md mt-2 ml-[21.5%]">
            <h3 className="m-0">Admin Dashboard</h3>

            <div className="flex items-center relative">
                <FaSearch className="absolute left-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search"
                    className="w-48 p-2 pl-10 border border-gray-300 rounded-full bg-gray-100 text-sm outline-none transition-all duration-300 ease-in-out shadow-sm focus:bg-white focus:border-gray-500 focus:shadow-md"
                />
            </div>
            
            <div className="flex items-center justify-center h-10 w-10 bg-yellow-500 rounded-full">
                <FaUserCircle className="text-white text-3xl" />
            </div>
            
        </div>
    );
}

export default TopPanel;
