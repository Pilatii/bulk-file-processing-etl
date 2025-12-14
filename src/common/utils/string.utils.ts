export function normalizeCsvKeys(obj: any) {
	const normalized = {};
	for (const key of Object.keys(obj)) {
		normalized[key.toLowerCase()] = obj[key];
	}
	return normalized;
}