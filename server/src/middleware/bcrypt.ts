import bcrypt from 'bcrypt';

export async function encrypt (pass: string) {
   const hash = await bcrypt.hash(pass, 10);
   return hash;
};

export async function compare (pass: string, hashPassword: string) {
   return await bcrypt.compare(pass, hashPassword);
};