export const PAGINATION_SIBLING_COUNT = 1

export const getPaginationRange = (currentPage: number, totalPages: number): (number | 'ellipsis')[] => {
  const totalPageNumbers = PAGINATION_SIBLING_COUNT * 2 + 5

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const leftSiblingIndex = Math.max(currentPage - PAGINATION_SIBLING_COUNT, 1)
  const rightSiblingIndex = Math.min(currentPage + PAGINATION_SIBLING_COUNT, totalPages)
  const showLeftEllipsis = leftSiblingIndex > 2
  const showRightEllipsis = rightSiblingIndex < totalPages - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRangeLength = 3 + PAGINATION_SIBLING_COUNT * 2

    return [...Array.from({ length: leftRangeLength }, (_, index) => index + 1), 'ellipsis', totalPages]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRangeLength = 3 + PAGINATION_SIBLING_COUNT * 2

    return [
      1,
      'ellipsis',
      ...Array.from({ length: rightRangeLength }, (_, index) => totalPages - rightRangeLength + index + 1)
    ]
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, index) => leftSiblingIndex + index
  )

  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages]
}
