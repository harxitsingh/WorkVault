import mongoose from 'mongoose';

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/workvault');
  const res = await mongoose.connection.collection('users').updateOne(
    { email: 'admin@example.com' },
    { $set: { role: 'admin', baseRole: 'admin', activeRole: 'admin' } }
  );
  console.log('Update result:', res);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
