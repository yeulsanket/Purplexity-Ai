import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

mongoose.connect('mongodb+srv://sanketyeul:sanket123@cluster0.p87dwbd.mongodb.net/perplexity')
  .then(async () => {
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log("Users:", users.map(u => ({
        email: u.email,
        verified: u.verified,
        passwordLength: u.password.length,
        passwordStart: u.password.substring(0, 7)
    })));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
