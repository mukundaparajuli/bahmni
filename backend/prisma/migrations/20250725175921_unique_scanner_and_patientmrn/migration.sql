/*
  Warnings:

  - A unique constraint covering the columns `[scannerId,patientMRN]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Document_scannerId_patientMRN_key" ON "Document"("scannerId", "patientMRN");
