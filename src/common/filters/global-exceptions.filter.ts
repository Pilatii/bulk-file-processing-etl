import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { HttpDomainError } from "../errors/http-domain-error";

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		// Erros HTTP do próprio Nest
		if (exception instanceof HttpException) {
			return response
				.status(exception.getStatus())
				.json({ message: exception.message });
		}

		// Erros de domínio personalizados
		if (exception instanceof HttpDomainError) {
			return response
				.status(exception.status)
				.json({ message: exception.message });
		}

		// Erro desconhecido
		return response
			.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.json({ message: "Erro interno do servidor" });
	}
}
