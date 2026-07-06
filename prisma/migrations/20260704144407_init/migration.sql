-- CreateTable
CREATE TABLE "Option" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "autoload" TEXT NOT NULL DEFAULT 'yes'
);

-- CreateIndex
CREATE UNIQUE INDEX "Option_key_key" ON "Option"("key");
