export async function createJobIndexes(db) {
  try {
    await db.collection("jobs").createIndex({ userId: 1, createdAt: -1 });

    await db.collection("jobs").createIndex({ status: 1, createdAt: -1 });

    await db.collection("jobs").createIndex({ userId: 1, status: 1 });

    await db.collection("jobs").createIndex({
      jobTitle: "text",
      companyName: "text",
      location: "text"
    });

    await db.collection("jobs").createIndex({
      userId: 1,
      status: 1,
      applicationDeadline: 1
    });
  } catch (error) {
    console.error(error);
  }
}