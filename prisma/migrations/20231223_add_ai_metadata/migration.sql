-- Add aiMetadata field to MarketplaceItem, FoodItem, and Event tables
ALTER TABLE "MarketplaceItem" ADD COLUMN "aiMetadata" JSONB;
ALTER TABLE "FoodItem" ADD COLUMN "aiMetadata" JSONB;
ALTER TABLE "Event" ADD COLUMN "aiMetadata" JSONB;

