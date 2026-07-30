import app from './app';
import config from './config';
import { prisma } from './lib/prisma';

const PORT = config.port;


async function main() {
  try {
    await prisma.$connect();
    console.log('connected to the database successfully');

    app.listen(PORT, () => {
      console.log(`server is runing port on ${PORT}`);
    });
  } catch (error) {
    console.error('error ', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
main();
