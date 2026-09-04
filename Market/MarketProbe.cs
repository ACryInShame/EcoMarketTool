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
    }
}