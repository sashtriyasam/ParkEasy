import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Production safety guard
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_QA_SCRIPT !== 'true') {
    console.error('❌ SAFETY ABORT: Cannot run QA scripts in production without ALLOW_QA_SCRIPT=true');
    process.exit(1);
  }

  console.log('--- UPDATING FACILITY COORDINATES ---');
  
  const result = await prisma.parkingFacility.updateMany({
    where: { name: 'LOCAL TEST GARAGE' },
    data: {
      latitude: 19.0760,
      longitude: 72.8777,
      city: 'Mumbai'
    }
  });
  
  console.log(`✅ Updated ${result.count} facilities.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
