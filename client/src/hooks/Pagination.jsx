import React from 'react';
import PropTypes from 'prop-types';
import { Pagination } from '@mui/material';

const PaginationComponent = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  siblingCount = 1, 
  className 
}) => {
  const handlePageChange = (event, page) => {
    onPageChange(page);
  };

  return (
    <div className={`flex justify-center my-2 ${className}`}>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        siblingCount={siblingCount}
        shape="rounded"
        variant="outlined"
        color="primary"
        className="bg-white" // Tailwind CSS class for background color
      />
    </div>
  );
};

// PropTypes for type checking
PaginationComponent.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  siblingCount: PropTypes.number,
  className: PropTypes.string,
};

export default PaginationComponent;
