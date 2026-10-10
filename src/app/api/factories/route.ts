import { NextResponse } from 'next/server';
import { getFactories, getMarketPrices } from '@/lib/db/client';
import { FactoryComparisonItem } from '@/lib/engine/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district') || undefined;
    const weightKg = Number(searchParams.get('weightKg')) || 100;

    const factories = await getFactories({ district, onlyActive: true });
    const verifiedPrices = await getMarketPrices({ status: 'verified', district });

    const comparisonList: FactoryComparisonItem[] = factories.map((factory) => {
      // Find prices matching this factory
      const factoryPrices = verifiedPrices.filter((p) => p.factoryId === factory.id);
      const bestPrice = factoryPrices[0]; // best or recent

      if (!bestPrice) {
        return {
          factoryId: factory.id,
          factoryName: factory.name,
          district: factory.district,
          locality: factory.locality,
          elevationCategory: factory.elevationCategory,
          hasEligiblePrice: false,
          collectionAvailable: factory.collectionAvailable,
          paymentCycle: factory.paymentCycleDescription,
        };
      }

      const grossMin = bestPrice.minPrice * weightKg;
      const grossMax = bestPrice.maxPrice * weightKg;

      return {
        factoryId: factory.id,
        factoryName: factory.name,
        district: factory.district,
        locality: factory.locality,
        elevationCategory: factory.elevationCategory,
        hasEligiblePrice: true,
        priceMin: bestPrice.minPrice,
        priceMax: bestPrice.maxPrice,
        qualityCategory: bestPrice.qualityCategoryRef || (bestPrice.priceBasis === 'factory-base' ? 'Standard Factory Base' : 'General'),
        transportCost: 0,
        otherDeductions: 0,
        netRevenueMin: grossMin,
        netRevenueMax: grossMax,
        collectionAvailable: factory.collectionAvailable,
        paymentCycle: factory.paymentCycleDescription,
        sourceName: bestPrice.sourceName,
        sourceDate: bestPrice.validFrom,
        recordVerificationStatus: bestPrice.verificationStatus,
        rankingScore: grossMin, // Ranked by highest estimated minimum net revenue
      };
    });

    // Sort comparison list: those with eligible prices first, ordered by highest min revenue
    comparisonList.sort((a, b) => {
      if (a.hasEligiblePrice && !b.hasEligiblePrice) return -1;
      if (!a.hasEligiblePrice && b.hasEligiblePrice) return 1;
      return (b.rankingScore || 0) - (a.rankingScore || 0);
    });

    return NextResponse.json({
      success: true,
      comparisonList,
      rankingExplanation: 'Factories are sorted by highest estimated minimum net revenue for the specified quantity. Unknown values are explicitly noted.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch factory comparison data.' }, { status: 500 });
  }
}
