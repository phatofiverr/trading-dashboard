
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TradePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TradePagination: React.FC<TradePaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          />
        </PaginationItem>
        
        {/* Display first page */}
        {totalPages > 3 && currentPage > 2 && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
          </PaginationItem>
        )}
        
        {/* Ellipsis if needed */}
        {totalPages > 3 && currentPage > 3 && (
          <PaginationItem>
            <PaginationLink>...</PaginationLink>
          </PaginationItem>
        )}
        
        {/* Current page and adjacent pages */}
        {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
          let pageNum = currentPage - 1 + i;
          
          if (currentPage === 1) {
            pageNum = i + 1;
          } else if (currentPage === totalPages) {
            pageNum = totalPages - 2 + i;
          }
          
          if (pageNum > 0 && pageNum <= totalPages) {
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink 
                  isActive={currentPage === pageNum}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          }
          return null;
        })}
        
        {/* Ellipsis if needed */}
        {totalPages > 3 && currentPage < totalPages - 2 && (
          <PaginationItem>
            <PaginationLink>...</PaginationLink>
          </PaginationItem>
        )}
        
        {/* Last page */}
        {totalPages > 3 && currentPage < totalPages - 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default TradePagination;
