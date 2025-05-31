/**
 * Generates an array of page numbers and ellipsis markers for pagination
 * @param currentPage - The current active page
 * @param totalPages - Total number of pages
 * @param windowSize - Number of pages to show around current page (default: 2)
 * @returns Array of numbers or 'ellipsis' strings representing the pagination structure
 */
export const getPaginationVisiblePages = (
	currentPage: number,
	totalPages: number,
	windowSize: number = 2,
): (number | "ellipsis")[] => {
	// Handle edge cases
	if (totalPages <= 1) return [1];
	if (totalPages <= 5)
		return Array.from({ length: totalPages }, (_, i) => i + 1);

	const pages: (number | "ellipsis")[] = [];

	// Calculate window boundaries
	const leftBound = Math.max(2, currentPage - windowSize);
	const rightBound = Math.min(totalPages - 1, currentPage + windowSize);

	// Always add page 1
	pages.push(1);

	// Add left ellipsis if needed
	if (leftBound > 2) {
		pages.push("ellipsis");
	}

	// Add pages within the window
	for (let i = leftBound; i <= rightBound; i++) {
		pages.push(i);
	}

	// Add right ellipsis if needed
	if (rightBound < totalPages - 1) {
		pages.push("ellipsis");
	}

	// Always add last page
	if (totalPages > 1) {
		pages.push(totalPages);
	}

	return pages;
};
