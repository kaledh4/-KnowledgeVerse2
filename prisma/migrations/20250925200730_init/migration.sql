-- CreateTable
CREATE TABLE "knowledge_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "originalSource" TEXT NOT NULL,
    "textForEmbedding" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "chromaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
