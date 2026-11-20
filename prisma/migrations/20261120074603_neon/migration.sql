-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "passwordHash" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "vetId" INTEGER,
ALTER COLUMN "passwordHash" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "User_vetId_idx" ON "User"("vetId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
