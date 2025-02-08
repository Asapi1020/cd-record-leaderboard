import type { Record } from "./type";

export class CDAPIClient {
	private apiURL: string;
	
	constructor(){
		if(!import.meta.env.VITE_CD_API_URL){
			throw new Error("CD API URL is undefined");
		}

		this.apiURL = import.meta.env.VITE_CD_API_URL;
	}

	public async getRecords(page: number): Promise<[Record[], number]> {
		const response = await this.get(`/records?page=${page}`);
		if(!response.ok){
			console.error(response);
			throw new Error("HTTP Error");
		}
		const data = await response.json();
		return await [data.data, data.total];
	}

	private async get(path: string){
		return await fetch(`${this.apiURL}/api${path}`);
	}
}
