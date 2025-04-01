import {
	toRecord,
	toRecordData,
	toUserStatsArray,
} from "./interface-adapters/record";
import type { Record, SteamAccount, UserStats } from "./type";

export class CDAPIClient {
	private apiURL: string;

	constructor() {
		if (!import.meta.env.VITE_CD_API_URL) {
			throw new Error("CD API URL is undefined");
		}

		this.apiURL = import.meta.env.VITE_CD_API_URL;
	}

	public async getRecord(id: string): Promise<Record> {
		const response = await this.get(`/v2/records/${id}`);
		if (!response.ok) {
			console.error(response);
			throw new Error("HTTP Error");
		}
		const data = await response.json();
		return toRecord(data);
	}

	public async getRecords(
		page: number,
		isVictory: boolean,
		steamID?: string,
		isAll = false,
	): Promise<[Record[], number]> {
		const response = await this.get(
			`/records?page=${page}` +
				`${isVictory ? "&isVictory=1" : ""}` +
				`${steamID ? `&steamID=${steamID}` : ""}` +
				`${isAll ? "&isAll=1" : ""}`,
		);
		if (!response.ok) {
			console.error(response);
			throw new Error("HTTP Error");
		}
		const data = await response.json();
		return [data.data, data.total];
	}

	public async getRecordsV2(
		page: number,
		isVictory: boolean,
	): Promise<[Record[], number]> {
		const response = await this.get(
			`/v2/records?page=${page}` + `${isVictory ? "&isVictory=true" : ""}`,
		);
		if (!response.ok) {
			console.error(response);
			throw new Error("HTTP Error");
		}
		const data = await response.json();
		const [records, total] = toRecordData(data);
		return [records, total];
	}

	public async getPlayersRecords(
		steamID: string,
		page: number,
		isVictory: boolean,
	): Promise<[Record[], number]> {
		console.log(steamID, page, isVictory);
		const response = await this.get(
			`/v2/users/${steamID}/records?page=${page}` +
				`${isVictory ? "&isVictory=true" : ""}`,
		);
		if (!response.ok) {
			console.error(response);
			throw new Error("HTTP Error");
		}
		const data = await response.json();
		const [records, total] = toRecordData(data);
		return [records, total];
	}

	public async getPlayerData(steamIDs: string[]): Promise<SteamAccount[]> {
		const response = await this.get(`/players?id=${steamIDs.join(",")}`);
		if (!response.ok) {
			console.error(response);
			throw new Error("HTTP Error");
		}
		const data = await response.json();
		return data;
	}

	public async getPlayerStats(steamID: string): Promise<UserStats[]> {
		const response = await this.get(`/v2/users/${steamID}/stats`);
		if (!response.ok) {
			console.error(response);
			throw new Error("HTTP Error");
		}
		const data = await response.json();
		return toUserStatsArray(data);
	}

	private async get(path: string) {
		return await fetch(`${this.apiURL}/api${path}`);
	}
}
