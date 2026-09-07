using System;
using System.Collections.Generic;
using UnityEngine;


namespace EcoMarketTools
{
    // --- MarketProbe ---
    // responsibile for pulling Market information from Eco
    public class MarketProbe
    {
        // Singleton for MarketPrope
        private static readonly MarketProbe LocalInstance =
            new MarketProbe();

        // Expose singleton in method to allow easier changes later
        public static MarketProbe Instance
        {
            get { return LocalInstance; }
        }

        // List of all trade offers
        private readonly List<MarketOffer> AllOffers =
            new List<MarketOffer>();

        // Wrapper object for trade offers
        // exposes the offer list without allowing other classes
        // to add, remove, or clear offers.
        public IReadOnlyList<MarketOffer> AllMarketOffers { get { return AllOffers; } }

        // Pull market data from Eco
        public void PullMarketData( EconomyTrackerView Tracker)
        {
            try
            {
                if (Tracker == null)
                {
                    Plugin.PluginLog.LogWarning(
                        "[EcoMarketTools] EconomyTrackerView was null."
                    );

                    return;
                }

                // pull all trades from tracker
                var Trades = Tracker.Trades;

                if (Trades == null)
                {
                    Plugin.PluginLog.LogWarning(
                        "[EcoMarketTools] Trades list was null."
                    );

                    return;
                }

                List<MarketOffer> NewOffers =
                    new List<MarketOffer>();

                // Take each trade and create a Market Offer with the data needed
                // this copy of the data gives a boundary of Game and Mod as we do not know 
                // how the game uses and changes the data. Direct use may cause thread or other issues.
                foreach (TradeTrackerView CurrentTrade in Trades)
                {
                    foreach ( MarketOffer Offer 
                        in MarketOfferConverter.Convert(CurrentTrade) )
                    {
                        NewOffers.Add(Offer);
                    }
                }

                AllOffers.Clear();
                AllOffers.AddRange(NewOffers);
            }
            catch (Exception EX)
            {
                Plugin.PluginLog.LogError(
                    $"[EcoMarketTools] Market pull failed: {EX}"
                );
            }
        }
    }
}