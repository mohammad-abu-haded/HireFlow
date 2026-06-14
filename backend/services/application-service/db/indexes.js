async function createApplicationIndexes(db) {
  try {
    await db.collection("applications").createIndex({ jobId: 1 });

    await db.collection("applications").createIndex({ applicantId: 1 });

    await db.collection("applications").createIndex({ jobId: 1, status: 1 });

    await db.collection("applications").createIndex({ jobId: 1, createdAt: -1 });

    await db.collection("applications").createIndex({ createdAt: 1 });
  } catch (error) {
    console.error(error);
  }
}

module.exports = { createApplicationIndexes };