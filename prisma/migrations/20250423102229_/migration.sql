-- CreateTable
CREATE TABLE "PromptTable" (
    "id" TEXT NOT NULL,
    "languageCode" VARCHAR(20) NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptTable_pkey" PRIMARY KEY ("id")
);
