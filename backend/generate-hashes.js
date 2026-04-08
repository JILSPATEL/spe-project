const bcrypt = require('bcryptjs');

async function generatePasswordHashes() {
    console.log('Generating bcrypt hashes for seed data...\n');

    // Generate hash for: abc@123
    const hash1 = await bcrypt.hash('abc@123', 10);
    console.log('Password: abc@123');
    console.log(`Hash: ${hash1}\n`);

    // Generate hash for: seller1@123
    const hash2 = await bcrypt.hash('seller1@123', 10);
    console.log('Password: seller1@123');
    console.log(`Hash: ${hash2}\n`);

    // Generate hash for: user@123
    const hash3 = await bcrypt.hash('user@123', 10);
    console.log('Password: user@123');
    console.log(`Hash: ${hash3}\n`);

    console.log('Copy these hashes to update seed.sql');
}

generatePasswordHashes().catch(console.error);
