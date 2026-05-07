import "./config";
import "dotenv/config";
import app from "./app";
import { prisma } from "./database/client";

const PORT = 3000;

async function bootstrap() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("DB bağlantısı başarılı");

    app.listen(PORT, () => {
      console.log(`Server çalışıyor: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("DB bağlantısı başarısız:", error);
    process.exit(1);
  }
}

bootstrap();