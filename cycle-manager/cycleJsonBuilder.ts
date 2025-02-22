import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path, { join } from "node:path";

const directoryPath = path.join(__dirname, "cycles");
const outputFilePath = path.join(__dirname, "cycles.json");
const files = readdirSync(directoryPath);

const cycles: Record<string, string[]> = {};

for (const file of files) {
	const filePath = join(directoryPath, file);
	const fileContent = readFileSync(filePath, "utf-8");

	const matches = fileContent.match(/SpawnCycleDefs=([^\s]+)/g);
	if (matches) {
		cycles[file] = matches.map((match) => match.split("=")[1]);
	} else {
		cycles[file] = [];
	}
}

writeFileSync(outputFilePath, JSON.stringify(cycles, null, 2), "utf-8");
