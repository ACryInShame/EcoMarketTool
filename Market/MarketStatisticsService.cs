using System.Collections.Generic;
using System.Linq;

namespace EcoMarketTools
{
    public static class MarketStatisticsService
    {
        public static MarketStatistics Calculate(
            IEnumerable<MarketOffer> offers)
        {
            List<MarketOffer> offerList =
                offers?.ToList()
                ?? new List<MarketOffer>();

            if (offerList.Count == 0)
                return new MarketStatistics();

            List<float> prices = offerList
                .Select(o => o.Price)
                .OrderBy(p => p)
                .ToList();

            float median;

            int middle = prices.Count / 2;

            if (prices.Count % 2 == 0)
            {
                median =
                    (prices[middle - 1] +
                     prices[middle]) / 2f;
            }
            else
            {
                median = prices[middle];
            }

            var modeGroup = prices
                .GroupBy(p => p)
                .OrderByDescending(g => g.Count())
                .ThenBy(g => g.Key)
                .First();

            return new MarketStatistics
            {
                Minimum = prices.Min(),

                Maximum = prices.Max(),

                Mean = prices.Average(),

                Median = median,

                Mode = modeGroup.Key,

                OfferCount = offerList.Count,

                StoreCount = offerList
                    .Select(o => o.StoreName)
                    .Distinct()
                    .Count(),

                TotalQuantity = offerList
                    .Sum(o => o.Quantity)
            };
        }
    }
}