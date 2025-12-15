import { NestFactory } from "@nestjs/core";
import { ApiModule } from "./api.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
	const app = await NestFactory.create(ApiModule);

	const config = new DocumentBuilder()
		.setTitle("Api")
		.setDescription("Api para importação de arquivos CSV")
		.setVersion("1.0")
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup("swagger", app, document)

	await app.listen(3000, '0.0.0.0');
}
bootstrap();