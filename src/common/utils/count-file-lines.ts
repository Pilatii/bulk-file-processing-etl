import * as fs from "fs";
import * as Readline from "readline";

export async function countFileLines(filePath: string): Promise<number> {
	const rl = Readline.createInterface({
		input: fs.createReadStream(filePath),
		crlfDelay: Infinity,
	});

	let lines = 0;
	for await (const _ of rl) lines++;

	return lines - 1;
}
