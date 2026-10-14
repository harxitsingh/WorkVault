import { useState, useMemo } from 'react';

export const usePagination = (items = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const begin = (currentPage - 1) * itemsPerPage;
    const end = begin + itemsPerPage;
    return items.slice(begin, end);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  const nextPage = () => {
    setCurrentPage(page => Math.min(page + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(page => Math.max(page - 1, 1));
  };

  return {
    currentItems,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    totalItems: items.length
  };
};

export default usePagination;
