-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ModePaiement" ADD VALUE 'WAVE';
ALTER TYPE "ModePaiement" ADD VALUE 'ORANGE_MONEY';
ALTER TYPE "ModePaiement" ADD VALUE 'CARTE_BANCAIRE';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "ventes" ADD COLUMN     "modePaiement" "ModePaiement" NOT NULL DEFAULT 'ESPECES';
