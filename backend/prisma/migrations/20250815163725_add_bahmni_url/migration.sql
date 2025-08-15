/*
  Warnings:

  - A unique constraint covering the columns `[bahmniUrl]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "bahmniUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Document_bahmniUrl_key" ON "Document"("bahmniUrl");
