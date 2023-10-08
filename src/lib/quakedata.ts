const quakes = [
	{ type: 'M', long: -16.49, lat: 1.2, date: 77287560000 },
	{ type: 'M', long: 7.23, lat: 23.42, date: 84146880000 },
	{ type: 'M', long: 20.57, lat: 15.19, date: 86669880000 },
	{ type: 'M', long: -20.74, lat: -17.94, date: 128271780000 },
	{ type: 'M', long: 6.49, lat: 20.35, date: 145987500000 },
	{ type: 'M', long: 21.73, lat: -8.88, date: 156881700000 },
	{ type: 'M', long: -8.07, lat: 2.44, date: 159026820000 },
	{ type: 'M', long: 3.42, lat: -49.93, date: 165984540000 },
	{ type: 'M', long: -8.95, lat: -14.33, date: 204804120000 },
	{ type: 'M', long: 2.71, lat: 70.76, date: 66051060000 },
	{ type: 'M', long: 37.94, lat: 28.16, date: 120530760000 },
	{ type: 'M', long: -34.55, lat: 7.64, date: 138234540000 },
	{ type: 'M', long: 41.61, lat: 3.14, date: 169164720000 },
	{ type: 'M', long: 59.78, lat: -38.17, date: 193061460000 },
	{ type: 'M', long: -59.98, lat: -18.5, date: 232774320000 },
	{ type: 'M', long: -73.54, lat: -9.82, date: 238990920000 },
	{ type: 'M', long: -121.3, lat: -36.4, date: 171122340000 },
	{ type: 'M', long: -85.07, lat: 21.54, date: 219471120000 },
	{ type: 'M', long: 137.69, lat: 33.14, date: 120820260000 },
	{ type: 'SH', long: -24.62, lat: -16.15, date: 163998180000 },
	{ type: 'SH', long: 49.33, lat: 11.99, date: 88194900000 },
	{ type: 'SH', long: 36.81, lat: 45.84, date: 95227680000 },
	{ type: 'SH', long: 56.25, lat: 64.83, date: 161424840000 },
	{ type: 'SH', long: 32.12, lat: 42.28, date: 192298740000 },
	{ type: 'SH', long: -24.76, lat: 50.23, date: 197651520000 },
	{ type: 'SH', long: 87.09, lat: 25.01, date: 145428360000 },
	{ type: 'SH', long: -90.57, lat: 27.41, date: 160641720000 },
	{ type: 'A01', long: -34.04, lat: -15.27, date: 120820200000 },
	{ type: 'A06', long: 47.57, lat: 47.22, date: 207845520000 },
	{ type: 'A07', long: 48.41, lat: 22.94, date: 207817860000 },
	{ type: 'A08', long: -28.1, lat: -28, date: 235320720000 },
	{ type: 'A09', long: -30.8, lat: -37.8, date: 232675080000 },
	{ type: 'A11', long: 15.75, lat: 8.83, date: 238064460000 },
	{ type: 'A14', long: -30.48, lat: -25.82, date: 110155980000 },
	{ type: 'A16', long: 4.06, lat: 6.66, date: 90102240000 },
	{ type: 'A17', long: -16.27, lat: 21.56, date: 92584320000 },
	{ type: 'A18', long: 31.01, lat: 17.54, date: 97818600000 },
	{ type: 'A20', long: -34.84, lat: 20.46, date: 77491080000 },
	{ type: 'A24', long: -34.32, lat: -32.89, date: 237593820000 },
	{ type: 'A25', long: 53.67, lat: 33.31, date: 237341700000 },
	{ type: 'A27', long: 16.21, lat: 20.12, date: 235281660000 },
	{ type: 'A30', long: -30.38, lat: 11.22, date: 77604120000 },
	{ type: 'A33', long: 113.03, lat: 7.71, date: 90376500000 },
	{ type: 'A34', long: -8.42, lat: 6.99, date: 80001240000 },
	{ type: 'A40', long: -10.32, lat: -0.9, date: 112679280000 },
	{ type: 'A41', long: -23.1, lat: 12.7, date: 79474560000 },
	{ type: 'A42', long: -23.1, lat: 12.7, date: 107934720000 },
	{ type: 'A44', long: 49.17, lat: 48.74, date: 140857740000 },
	{ type: 'A50', long: -47.41, lat: 9.36, date: 107586300000 },
	{ type: 'A51', long: 14.42, lat: 8.63, date: 132845700000 },
	{ type: 'A97', long: 16.39, lat: -2.36, date: 235562880000 },
]
.sort((a, b) => a.date - b.date)
.map((p, i) => ({
	...p,
	index: i,
}));

export const landers = [
	{ type: '12 LM', long: -21.2, lat: -3.94, date: -938580000 },
	{ type: '13 S-IVB', long: -27.86, lat: -2.75, date: 11599740000 },
	{ type: '14 S-IVB', long: -26.02, lat: -8.09, date: 36938400000 },
	{ type: '14 LM', long: -19.67, lat: -3.42, date: 37172700000 },
	{ type: '15 S-IVB', long: -11.81, lat: -1.51, date: 52361880000 },
	{ type: '15 LM', long: 0.25, lat: 26.36, date: 52729380000 },
	{ type: '17 S-IVB', long: -12.31, lat: -4.21, date: 95563920000 },
];

export default quakes;

// Returns the quakes that are within `range` of the given date
export function quakesCloseTo(date: number, range: number) {
	return quakes.filter(q => Math.abs(q.date - date) <= range);
}