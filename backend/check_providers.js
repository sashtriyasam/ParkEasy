const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching providers...');
    const providers = await prisma.user.findMany({
        where: { role: 'PROVIDER' },
        select: {
            id: true,
            email: true,
            full_name: true,
            role: true
        }
    });
    console.log('Providers found:');
    const sanitized = providers.map(p => {
        const email = p.email || '';
        const parts = email.split('@');
        const domain = parts[1];
        
        return {
            ...p,
            email: (email && domain) ? `${email.charAt(0)}***@${domain}` : (email ? '***' : 'N/A')
        };
    });
    console.log(JSON.stringify(sanitized, null, 2));
}

main()
    .catch((err) => {
        console.error('Error fetching providers:', err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
