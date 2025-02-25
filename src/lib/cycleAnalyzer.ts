export enum GameLength {
	Short = 0,
	Medium = 1,
	Long = 2,
}

export enum Difficulty {
	Normal = 0,
	Hard = 1,
	Suicidal = 2,
	HellOnEarth = 3,
}

export const analyzeCycle = (
	cycleDefs: string[],
	gameLength: GameLength,
	difficulty: Difficulty,
	waveSizeFakes: number,
): string => {
	return ""; // TODO: analyze whole cycle
};

export const extractCycleDefsByGameLength = (
	cycleDefs: string[],
	gameLength: GameLength,
): string[] => {
	switch (gameLength) {
		case GameLength.Short: {
			return extractShortCycleDefs(cycleDefs);
		}
		case GameLength.Medium: {
			return extractMediumCycleDefs(cycleDefs);
		}
		case GameLength.Long: {
			return extractLongCycleDefs(cycleDefs);
		}
		default: {
			return [];
		}
	}
};

const extractCycleDefs = (
	cycleDefs: string[],
	indexesToRemove: number[],
): string[] => {
	indexesToRemove.sort((a, b) => b - a);

	for (const index of indexesToRemove) {
		cycleDefs.splice(index, 1);
	}
	return cycleDefs;
};

const extractShortCycleDefs = (cycleDefs: string[]): string[] => {
	switch (cycleDefs.length) {
		case GameLength.Short: {
			return cycleDefs;
		}
		case GameLength.Medium: {
			return extractCycleDefs(cycleDefs, [1, 3, 5]);
		}
		case GameLength.Long: {
			return extractCycleDefs(cycleDefs, [1, 2, 4, 5, 7, 8]);
		}
		default: {
			return [];
		}
	}
};

const extractMediumCycleDefs = (cycleDefs: string[]): string[] => {
	switch (cycleDefs.length) {
		case GameLength.Short: {
			console.error("Invalid game length");
			return [];
		}
		case GameLength.Medium: {
			return cycleDefs;
		}
		case GameLength.Long: {
			return extractCycleDefs(cycleDefs, [3, 5, 8]);
		}
		default: {
			return [];
		}
	}
};

const extractLongCycleDefs = (cycleDefs: string[]): string[] => {
	switch (cycleDefs.length) {
		case GameLength.Short:
		case GameLength.Medium: {
			console.error("Invalid game length");
			return [];
		}
		case GameLength.Long: {
			return cycleDefs;
		}
		default: {
			return [];
		}
	}
};

const calcMultiplier = (waveSizeFakes: number): number => {
	const defaultMultiplier = [1.0, 2.0, 2.75, 3.5, 4.0, 4.5];
	if (waveSizeFakes < 1) {
		console.error(`Wave Size Fakes must be positive but ${waveSizeFakes}`);
		return 0;
	}
	if (waveSizeFakes <= 6) {
		return defaultMultiplier[waveSizeFakes - 1];
	}
	return defaultMultiplier[5] + (waveSizeFakes - 6) * 0.211718;
};

const calcWaveSize = (
	waveNum: number,
	gameLength: GameLength,
	difficulty: Difficulty,
	waveSizeFakes: number,
): number => {
	const defaultBaseNum = [
		[25, 32, 35, 42],
		[25, 28, 32, 32, 35, 40, 42],
		[25, 28, 32, 32, 35, 35, 35, 40, 42, 42],
	];
	const defaultDifficultyMod = [0.85, 1.0, 1.3, 1.7];

	const multiplier = calcMultiplier(waveSizeFakes);
	const baseNum = defaultBaseNum[gameLength][waveNum];
	const difficultyMod = defaultDifficultyMod[difficulty];
	return Math.floor(multiplier * baseNum * difficultyMod);
};

const analyzeWave = (waveDef: string, waveSize: number): GroupInfo[] => {
	let spawnCount = 0;
	const squads = waveDef.split(",");
	const groupsInfo: GroupInfo[] = [];

	do {
		for (const squad of squads) {
			const groups = squad.split("_");
			for (const group of groups) {
				const groupInfo = parseGroupInfo(group);
				if (!groupInfo) {
					return [];
				}

				// If the group size is too large, reduce it to fit the wave size
				if (spawnCount + groupInfo.groupSize > waveSize) {
					groupInfo.groupSize = waveSize - spawnCount;
				}

				spawnCount += groupInfo.groupSize;
				groupsInfo.push(groupInfo);

				if (spawnCount >= waveSize) {
					return groupsInfo;
				}
			}
		}
	} while (spawnCount < waveSize);
	return groupsInfo;
};

interface GroupInfo {
	groupSize: number;
	zedName: string;
	isSpawnRage: boolean;
}

const parseGroupInfo = (group: string): GroupInfo | undefined => {
	const parsedGroupDef = group.match(/(^\d+)|([A-Za-z]+)|([*!]$)/g);
	if (!parsedGroupDef || parsedGroupDef.length < 2) {
		console.error(`GroupDef is collapsed: ${group}`);
		return undefined;
	}

	const isAlbino = parsedGroupDef.length === 3 && parsedGroupDef[2] === "*";
	const isSpawnRage = parsedGroupDef.length === 3 && parsedGroupDef[2] === "!";
	const groupSize = Number(parsedGroupDef[0]);
	const zedName = resolveZedCode(parsedGroupDef[1], isAlbino);
	if (!zedName) {
		return undefined;
	}
	return {
		groupSize,
		zedName,
		isSpawnRage,
	};
};

const resolveZedCode = (zedCode: string, isAlbino: boolean): string | null => {
	switch (zedCode) {
		case "CY":
		case "CC": {
			return "Cyst";
		}
		case "AL":
		case "CA":
			return isAlbino ? "Rioter" : "Alpha Clot";
		case "SL":
		case "CS":
			return "Slasher";
		case "GF":
			return isAlbino ? "Gorefiend" : "Gorefast";
		case "CR":
			return isAlbino ? "Elite Crawler" : "Crawler";
		case "ST":
			return isAlbino ? randomEDAR() : "Stalker";
		case "BL":
			return "Bloat";
		case "HU":
			return isAlbino ? randomEDAR() : "Husk";
		case "SI":
			return "Siren";
		case "DE":
			return "EDAR Trapper";
		case "DL":
			return "EDAR Blaster";
		case "DR":
			return "EDAR Bomber";
		case "SC":
			return "Scrake";
		case "QP":
		case "MF":
			return "Quarterpound";
		case "FP":
			return "Fleshpound";
		default:
			console.error(`Unknown Zed Code: ${zedCode}`);
			return null;
	}
};

const randomEDAR = (): string | null => {
	const rand = Math.floor(Math.random() * 3);
	switch (rand) {
		case 0:
			return "EDAR Trapper";
		case 1:
			return "EDAR Blaster";
		case 2:
			return "EDAR Bomber";
		default:
			console.error(`something wrong with random output: ${rand}`);
			return null;
	}
};
