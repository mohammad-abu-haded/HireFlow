export async function createAuthIndexes(db) {
  try {
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
  } catch (error) {
    console.error(error);
  }
}