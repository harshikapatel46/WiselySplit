const serverDir = 'D:/wiselySplit/wiselySplit/server';
require(`${serverDir}/node_modules/dotenv`).config({ path: `${serverDir}/.env` });
const mongoose = require(`${serverDir}/node_modules/mongoose`);
const Room = require(`${serverDir}/src/models/Room`);
const Expense = require(`${serverDir}/src/models/Expense`);
const Settlement = require(`${serverDir}/src/models/Settlement`);
const crypto = require('crypto');

const BENCHMARK_CODE = 'AUDIT_BENCHMARK_ROOM';

const createEqualSplit = (amount, members) => {
  const amountInPaise = Math.round(Number(amount) * 100);
  const baseShare = Math.floor(amountInPaise / members.length);
  const remainder = amountInPaise % members.length;

  return members.map((member, index) => ({
    memberId: member.memberId,
    amount: (baseShare + (index < remainder ? 1 : 0)) / 100,
  }));
};

async function setupBenchmarkRoom() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB. Setting up dedicated benchmark room:', BENCHMARK_CODE);

  // Clean up previous benchmark room data if present
  await Room.deleteMany({ roomCode: BENCHMARK_CODE });
  await Expense.deleteMany({ roomCode: BENCHMARK_CODE });
  await Settlement.deleteMany({ roomCode: BENCHMARK_CODE });

  // 1. Create 10 members
  const members = [];
  for (let i = 1; i <= 10; i++) {
    members.push({
      memberId: `audit_user_${i}`,
      name: `Audit Member ${i}`,
    });
  }

  // 2. Create Room
  const room = await Room.create({
    name: 'WiselySplit Performance Audit Room',
    roomCode: BENCHMARK_CODE,
    baseCurrency: 'INR',
    members,
  });
  console.log(`Created Room ${room.name} (${room.roomCode}) with ${members.length} members.`);

  // 3. Create 50 realistic expenses
  const expenseDocs = [];
  for (let e = 1; e <= 50; e++) {
    const payer = members[(e - 1) % members.length].memberId;
    const amount = 200 + (e * 75); // ₹275 to ₹3950
    const splitBetween = createEqualSplit(amount, members);

    expenseDocs.push({
      roomCode: BENCHMARK_CODE,
      description: `Benchmark Expense #${e} - ${e % 2 === 0 ? 'Dinner & Outing' : 'Travel & Lodging'}`,
      amount,
      currency: 'INR',
      paidBy: payer,
      splitType: 'EQUAL',
      splitBetween,
      createdAt: new Date(Date.now() - (50 - e) * 3600000),
    });
  }
  await Expense.insertMany(expenseDocs);
  console.log(`Inserted 50 benchmark expenses for ${BENCHMARK_CODE}.`);

  // 4. Create 5 paid settlements
  const settlementDocs = [];
  for (let s = 1; s <= 5; s++) {
    const fromMember = members[s];
    const toMember = members[0];
    settlementDocs.push({
      roomCode: BENCHMARK_CODE,
      from: { memberId: fromMember.memberId, name: fromMember.name },
      to: { memberId: toMember.memberId, name: toMember.name },
      amount: 250 * s,
      status: 'PAID',
      createdAt: new Date(Date.now() - (10 - s) * 3600000),
    });
  }
  await Settlement.insertMany(settlementDocs);
  console.log(`Inserted 5 paid settlements for ${BENCHMARK_CODE}.`);

  console.log('Setup complete! The room is ready for load testing.\n');
  process.exit(0);
}

setupBenchmarkRoom().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});

