using System;
using System.Collections.Generic;
using UnityEngine;


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

        public string PlayerName
        {
            get;
            private set;
        } = "";

        public Vector3 PlayerPosition
        {
            get;
            private set;
        }

        public int PlayerCurrentWeight
        {
            get;
            private set;
        }

        public int PlayerMaxWeight
        {
            get;
            private set;
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

                UpdatePlayerState();
            }
            catch (Exception ex)
            {
                Plugin.PluginLog.LogError(
                    $"[EcoMarketTools] Market pull failed: {ex}"
                );
            }
        }

        private void UpdatePlayerState()
        {
            try
            {
                var player =
                    Player.obj;

                if (player == null)
                {
                    return;
                }

                PlayerName =
                    player.UserName;

                PlayerPosition =
                    Player.WrappedPos;
            }
            catch (System.Exception ex)
            {
                Plugin.PluginLog.LogError(
                    $"[EcoMarketTools] Player state failed: {ex}"
                );
            }
        }

        public void UpdatePlayerWeight(
                    int currentWeight,
                    int maxWeight)
        {
            PlayerCurrentWeight =
                currentWeight;

            PlayerMaxWeight =
                maxWeight;
        }

        private void ProbeItemLink(
    int itemId)
{
    try
    {
        string link =
            ClientUILinks.UILinkItem(
                itemId
            );

        Plugin.PluginLog.LogInfo(
            $"[EcoMarketTools] Item {itemId} link: {link}"
        );
    }
    catch (System.Exception ex)
    {
        Plugin.PluginLog.LogError(
            $"[EcoMarketTools] Item link probe failed: {ex}"
        );
    }
}

    }
}