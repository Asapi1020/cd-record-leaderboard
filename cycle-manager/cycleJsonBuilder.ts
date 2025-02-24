import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path, { join } from "node:path";

const directoryPath = path.join(__dirname, "cycles");
const outputDir = path.join(__dirname, "../public");
const outputFilePath = path.join(outputDir, "cycles.json");
const files = readdirSync(directoryPath);

const cycles: Record<string, string[]> = {};

for (const file of files) {
	if (!file.endsWith(".txt")) {
		continue;
	}

	const filePath = join(directoryPath, file);
	const fileContent = readFileSync(filePath, "utf-8");

	const matches = fileContent.match(/SpawnCycleDefs=([^\s]+)/g);
	const fileNameWithoutExt = path.basename(file, ".txt");
	cycles[fileNameWithoutExt] = matches
		? matches.map((match) => match.split("=")[1])
		: [];
}

writeFileSync(outputFilePath, JSON.stringify(cycles, null, 2), "utf-8");
