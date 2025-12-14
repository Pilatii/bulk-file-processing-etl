import { HttpStatus } from "@nestjs/common";

export class HttpDomainError extends Error {
	public readonly status: HttpStatus;

	constructor(message: string, status: HttpStatus) {
		super(message);
		this.status = status;
	}
}
