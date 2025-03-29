import {
	toString as convertToString,
	isArray,
	isObject,
	toBoolean,
	toNumber,
} from "@asp1020/type-utils";
import { throwInternalServerError } from "@this/lib/domain/ErrorHandler";
import type {
	CDInfo,
	MatchInfo,
	Record,
	UserStats,
	WeaponDamage,
	ZedKillType,
} from "@this/lib/type";

export const toRecordData = (data: unknown): [Record[], number] => {
	if (!isObject(data)) {
		return throwInternalServerError("Data is not an object");
	}
	if (!isArray(data.records)) {
		return throwInternalServerError("Records is not an array");
	}
	const records = data.records.map(toRecord);
	const total =
		toNumber(data.total) ?? throwInternalServerError("Total is not a number");
	return [records, total];
};

export const toRecord = (data: unknown): Record => {
	if (!isObject(data)) {
		return throwInternalServerError("Record is not an object");
	}
	if (!isArray(data.userStats)) {
		return throwInternalServerError("UserStats is not an array");
	}

	return {
		id:
			convertToString(data.id) ??
			throwInternalServerError("ID is not a string"),
		matchInfo: toMatchInfo(data.matchInfo),
		userStats: data.userStats.map(toUserStats),
	};
};

export const toMatchInfo = (data: unknown): MatchInfo => {
	if (!isObject(data)) {
		return throwInternalServerError("MatchInfo is not an object");
	}
	if (!isArray(data.cheatMessages)) {
		return throwInternalServerError("CheatMessages is not an array");
	}
	if (!isArray(data.mutators)) {
		return throwInternalServerError("Mutators is not an array");
	}

	return {
		timeStamp:
			convertToString(data.timeStamp) ??
			throwInternalServerError("TimeStamp is not a string"),
		mapName:
			convertToString(data.mapName) ??
			throwInternalServerError("MapName is not a string"),
		serverName: convertToString(data.serverName),
		serverIP:
			convertToString(data.serverIP) ??
			throwInternalServerError("ServerIP is not a string"),
		isVictory:
			toBoolean(data.isVictory) ??
			throwInternalServerError("IsVictory is not a boolean"),
		defeatWave:
			toNumber(data.defeatWave) ??
			throwInternalServerError("DefeatWave is not a number"),
		cheatMessages: data.cheatMessages.map(
			(msg) =>
				convertToString(msg) ??
				throwInternalServerError("CheatMessage is not a string"),
		),
		mutators: data.mutators.map(
			(mut) =>
				convertToString(mut) ??
				throwInternalServerError("Mutator is not a string"),
		),
		isSolo:
			toBoolean(data.isSolo) ??
			throwInternalServerError("IsSolo is not a boolean"),
		CDInfo: toCDInfo(data.CDInfo),
	};
};

export const toCDInfo = (data: unknown): CDInfo => {
	if (!isObject(data)) {
		return throwInternalServerError("CDInfo is not an object");
	}

	return {
		spawnCycle:
			convertToString(data.spawnCycle) ??
			throwInternalServerError("SpawnCycle is not a string"),
		maxMonsters:
			toNumber(data.maxMonsters) ??
			throwInternalServerError("MaxMonsters is not a number"),
		cohortSize:
			toNumber(data.cohortSize) ??
			throwInternalServerError("CohortSize is not a number"),
		spawnPoll:
			toNumber(data.spawnPoll) ??
			throwInternalServerError("SpawnPoll is not a number"),
		waveSizeFakes:
			toNumber(data.waveSizeFakes) ??
			throwInternalServerError("WaveSizeFakes is not a number"),
		spawnMod:
			toNumber(data.spawnMod) ??
			throwInternalServerError("SpawnMod is not a number"),
		trashHPFakes:
			toNumber(data.trashHPFakes) ??
			throwInternalServerError("TrashHPFakes is not a number"),
		QPHPFakes:
			toNumber(data.QPHPFakes) ??
			throwInternalServerError("QPHPFakes is not a number"),
		FPHPFakes:
			toNumber(data.FPHPFakes) ??
			throwInternalServerError("FPHPFakes is not a number"),
		SCHPFakes:
			toNumber(data.SCHPFakes) ??
			throwInternalServerError("SCHPFakes is not a number"),
		ZTSpawnMode:
			convertToString(data.ZTSpawnMode) ??
			throwInternalServerError("ZTSpawnMode is not a string"),
		ZTSpawnSlowDown:
			toNumber(data.ZTSpawnSlowDown) ??
			throwInternalServerError("ZTSpawnSlowDown is not a number"),
		albinoAlphas:
			toBoolean(data.albinoAlphas) ??
			throwInternalServerError("AlbinoAlphas is not a boolean"),
		albinoCrawlers:
			toBoolean(data.albinoCrawlers) ??
			throwInternalServerError("AlbinoCrawlers is not a boolean"),
		albinoGorefasts:
			toBoolean(data.albinoGorefasts) ??
			throwInternalServerError("AlbinoGorefasts is not a boolean"),
		disableRobots:
			toBoolean(data.disableRobots) ??
			throwInternalServerError("DisableRobots is not a boolean"),
		disableSpawners:
			toBoolean(data.disableSpawners) ??
			throwInternalServerError("DisableSpawners is not a boolean"),
		fleshpoundRageSpawns:
			toBoolean(data.fleshpoundRageSpawns) ??
			throwInternalServerError("FleshpoundRageSpawns is not a boolean"),
		startWithFullAmmo:
			toBoolean(data.startWithFullAmmo) ??
			throwInternalServerError("StartWithFullAmmo is not a boolean"),
		startWithFullArmor:
			toBoolean(data.startWithFullArmor) ??
			throwInternalServerError("StartWithFullArmor is not a boolean"),
		startWithFullGrenade:
			toBoolean(data.startWithFullGrenade) ??
			throwInternalServerError("StartWithFullGrenade is not a boolean"),
		zedsTeleportCloser:
			toBoolean(data.zedsTeleportCloser) ??
			throwInternalServerError("ZedsTeleportCloser is not a boolean"),
	};
};

export const toUserStats = (data: unknown): UserStats => {
	if (!isObject(data)) {
		return throwInternalServerError("UserStats is not an object");
	}
	if (!isArray(data.weaponDamages)) {
		return throwInternalServerError("WeaponDamages is not an array");
	}
	if (!isArray(data.zedKills)) {
		return throwInternalServerError("ZedKills is not an array");
	}

	return {
		playerName: convertToString(data.playerName),
		steamID:
			convertToString(data.steamID) ??
			throwInternalServerError("SteamID is not a string"),
		perkClass:
			convertToString(data.perkClass) ??
			throwInternalServerError("PerkClass is not a string"),
		playTime:
			toNumber(data.playTime) ??
			throwInternalServerError("PlayTime is not a number"),
		damageDealt:
			toNumber(data.damageDealt) ??
			throwInternalServerError("DamageDealt is not a number"),
		damageTaken:
			toNumber(data.damageTaken) ??
			throwInternalServerError("DamageTaken is not a number"),
		healsGiven:
			toNumber(data.healsGiven) ??
			throwInternalServerError("HealsGiven is not a number"),
		healsReceived:
			toNumber(data.healsReceived) ??
			throwInternalServerError("HealsReceived is not a number"),
		doshEarned:
			toNumber(data.doshEarned) ??
			throwInternalServerError("DoshEarned is not a number"),
		shotsFired:
			toNumber(data.shotsFired) ??
			throwInternalServerError("ShotsFired is not a number"),
		shotsHit:
			toNumber(data.shotsHit) ??
			throwInternalServerError("ShotsHit is not a number"),
		headShots:
			toNumber(data.headShots) ??
			throwInternalServerError("HeadShots is not a number"),
		deaths:
			toNumber(data.deaths) ??
			throwInternalServerError("Deaths is not a number"),
		weaponDamages: data.weaponDamages.map(toWeaponDamage),
		zedKills: data.zedKills.map(toZedKillType),
	};
};

export const toWeaponDamage = (data: unknown): WeaponDamage => {
	if (!isObject(data)) {
		return throwInternalServerError("WeaponDamage is not an object");
	}

	return {
		weaponDefClass:
			convertToString(data.weaponDefClass) ??
			throwInternalServerError("WeaponDefClass is not a string"),
		damageAmount:
			toNumber(data.damageAmount) ??
			throwInternalServerError("DamageAmount is not a number"),
		headShots:
			toNumber(data.headShots) ??
			throwInternalServerError("HeadShots is not a number"),
		largeZedKills:
			toNumber(data.largeZedKills) ??
			throwInternalServerError("LargeZedKills is not a number"),
	};
};

export const toZedKillType = (data: unknown): ZedKillType => {
	if (!isObject(data)) {
		return throwInternalServerError("ZedKillType is not an object");
	}

	return {
		zedClass:
			convertToString(data.zedClass) ??
			throwInternalServerError("ZedClass is not a string"),
		killCount:
			toNumber(data.killCount) ??
			throwInternalServerError("KillCount is not a number"),
	};
};
