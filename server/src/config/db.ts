import mongoose  from 'mongoose';

async function connectionDB(url: string) {
    await mongoose.connect(url) 
    .then(() => console.log("[db] Connection successful", url))
    .catch((err) => {
      console.log(`DB Connection Error: ${err.message}`);
    });
}

export default connectionDB;