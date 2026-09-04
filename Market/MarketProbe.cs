using System;
using System.Collections.Generic;

namespace EcoMarketTools
{
    public class MarketProbe
    {
        private static readonly MarketProbe instance =
            new MarketProbe();

        public static MarketProbe Instance
        {
            get { return instance; }
        }

        private readonly List<MarketOffer> allOffers =
            new List<MarketOffer>();

        public IReadOnlyList<MarketOffer> AllOffers
        {
            get { return allOffers; }
        }

        public void PullMarketData(
            EconomyViewerUI viewer)
        {
            try
            {
                if (viewer == null)
                    return;

                if (viewer.EconomyTrackerView == null)
                {
                    Plugin.PluginLog.LogWarning(
                        "[EcoMarketTools] EconomyTrackerView was null."
                    );

                    return;
                }

                var trades =
                    viewer.EconomyTrackerView.Trades;

                if (trades == null)
                {
                    Plugin.PluginLog.LogWarning(
                        "[EcoMarketTools] Trades list was null."
                    );

                    return;
                }

                List<MarketOffer> newOffers =
                    new List<MarketOffer>();

                foreach (TradeTrackerView trade in trades)
                {
                    foreach (
                        MarketOffer offer
                        in MarketOfferConverter.Convert(trade))
                    {
                        newOffers.Add(offer);
                    }
                }

                allOffers.Clear();
                allOffers.AddRange(newOffers);

                TEST();
                Plugin.PluginLog.LogInfo(
                    $"[EcoMarketTools] Loaded {allOffers.Count} valid market offers."
                );
            }
            catch (Exception ex)
            {
                Plugin.PluginLog.LogError(
                    $"[EcoMarketTools] Market pull failed: {ex}"
                );
            }
        }

        private void TEST ()
        {
            var filter = new MarketFilter
            {
                Type = MarketOrderType.Sell,
                ItemName = "Iron Ore",
                Currency = "Crater Coin"
            };

            var offers =
                MarketService.Filter(
                    allOffers,
                    filter
                );

            var stats =
                MarketStatisticsService.Calculate(
                    offers
                );

            Plugin.PluginLog.LogInfo(
                $"[TEST] Iron Ore Sell Offers: {stats.OfferCount}"
            );

            Plugin.PluginLog.LogInfo(
                $"[TEST] Min: {stats.Minimum}"
            );

            Plugin.PluginLog.LogInfo(
                $"[TEST] Max: {stats.Maximum}"
            );

            Plugin.PluginLog.LogInfo(
                $"[TEST] Mean: {stats.Mean}"
            );

            Plugin.PluginLog.LogInfo(
                $"[TEST] Median: {stats.Median}"
            );

            Plugin.PluginLog.LogInfo(
                $"[TEST] Mode: {stats.Mode}"
            );

            Plugin.PluginLog.LogInfo(
                $"[TEST] Stores: {stats.StoreCount}"
            );

            Plugin.PluginLog.LogInfo(
                $"[TEST] Quantity: {stats.TotalQuantity}"
            );
        }
    }
}