const { PrismaClient } = require('@prisma/client');
const { generateTicketPDF } = require('./src/utils/pdfGenerator');
const fs = require('fs');
const prisma = new PrismaClient();

async function debugPDF() {
    try {
        const ticketId = '812877d2-1915-49ce-9d40-0edbe1a0da10'; // Using known active ticket
        console.log('Fetching ticket:', ticketId);
        
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                slot: {
                    include: {
                        floor: {
                            include: {
                                facility: true
                            }
                        }
                    }
                },
                facility: true,
            }
        });

        if (!ticket) {
            console.error('Ticket not found!');
            return;
        }

        console.log('Generating PDF...');
        const buffer = await generateTicketPDF(ticket);
        console.log('PDF Generated. Buffer Result:', buffer ? `Length: ${buffer.length}` : 'NULL');
        
        if (Buffer.isBuffer(buffer) && buffer.length > 0) {
          fs.writeFileSync('debug_ticket.pdf', buffer);
          console.log(`✅ File saved successfully (${buffer.length} bytes) to debug_ticket.pdf`);
        } else {
          console.error('❌ PDF Buffer is invalid or empty. Skipping file write.');
        }

    } catch (error) {
        console.error('Error during PDF debug:', error);
    } finally {
        await prisma.$disconnect().catch((err) => {
            console.error('Error disconnecting Prisma logic:', err);
        });
    }
}

debugPDF().catch((err) => {
    console.error('Unhandled rejection in debugPDF entry point:', err);
    process.exit(1);
});
