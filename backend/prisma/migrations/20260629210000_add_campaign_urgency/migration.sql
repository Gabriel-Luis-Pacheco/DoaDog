ALTER TABLE "donation_campaigns" ADD COLUMN "urgency_level" "UrgencyLevel" NOT NULL DEFAULT 'MEDIUM';

CREATE INDEX "donation_campaigns_urgency_level_idx" ON "donation_campaigns"("urgency_level");
