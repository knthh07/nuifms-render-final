import React from "react";
import JobOrderTable from "./JobOrder/JobOrderPage";

const DashboardComponent = () => {
  return (
    <div className="flex flex-col px-4">
      <JobOrderTable />
    </div>
  );
};

export default DashboardComponent;
