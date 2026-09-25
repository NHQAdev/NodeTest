export const TOTAL_FLOORS = 10;
export const TOTAL_ELEVATORS = 3;

export const FLOOR_NUMBERS = Array.from(
	{ length: TOTAL_FLOORS },
	(_, index) => TOTAL_FLOORS - index
);