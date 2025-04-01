export const throwInternalServerError = (message: string): never => {
	throw new InternalServerError(message);
};

export const throwInvalidParameterError = (
	param: string,
	message?: string,
): never => {
	throw new BadRequestError(
		`Invalid parameter: ${param}${message ? ` - ${message}` : ""}`,
	);
};

export class InternalServerError extends Error {
	constructor(message: string) {
		super(`Internal Server Error: ${message}`);
		this.name = "InternalServerError";
	}
}

export class BadRequestError extends Error {
	constructor(message: string) {
		super(`Bad Request: ${message}`);
		this.name = "BadRequestError";
	}
}
