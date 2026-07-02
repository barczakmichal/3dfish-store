-- AlterTable: Add shipping/address fields to Order
ALTER TABLE "Order" ADD COLUMN "customerPhone" TEXT;
ALTER TABLE "Order" ADD COLUMN "street" TEXT;
ALTER TABLE "Order" ADD COLUMN "city" TEXT;
ALTER TABLE "Order" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "country" TEXT DEFAULT 'PL';
ALTER TABLE "Order" ADD COLUMN "shippingMethod" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingCarrier" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingCost" DECIMAL(10,2);
ALTER TABLE "Order" ADD COLUMN "trackingNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN "pickupPointId" TEXT;
ALTER TABLE "Order" ADD COLUMN "pickupPointName" TEXT;
ALTER TABLE "Order" ADD COLUMN "labelUrl" TEXT;
ALTER TABLE "Order" ADD COLUMN "furgonetkaId" TEXT;
ALTER TABLE "Order" ADD COLUMN "notes" TEXT;
ALTER TABLE "Order" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: Add weight/dimension fields to Product
ALTER TABLE "Product" ADD COLUMN "weightGrams" INTEGER;
ALTER TABLE "Product" ADD COLUMN "widthMm" INTEGER;
ALTER TABLE "Product" ADD COLUMN "heightMm" INTEGER;
ALTER TABLE "Product" ADD COLUMN "depthMm" INTEGER;
