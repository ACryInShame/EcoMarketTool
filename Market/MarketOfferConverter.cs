using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace EcoMarketTools
{
    public static class MarketOfferConverter
    {
        // Converts raw Eco trade data into a Market Offer for plugin use
        // IEnumerable used with yield return as Conversion can return 0,1 or 2 offers
        public static IEnumerable<MarketOffer> Convert( TradeTrackerView Trade)
        {
            if (Trade == null)
                yield break;

            if (IsValidSell(Trade))
            {
                yield return CreateOffer(Trade, MarketOrderType.Sell);
            }

            if (IsValidBuy(Trade))
            {
                yield return CreateOffer(Trade, MarketOrderType.Buy);
            }
        }

        // Creates an offer from the Trade Data
        private static MarketOffer CreateOffer(TradeTrackerView Trade, MarketOrderType MarketType)
        {
            // Format StoreName
            string RawStoreName = Trade.SourceName?.NotTranslated ?? "";

            string StoreName = StripEcoMarkup(RawStoreName);

            if (StoreName.StartsWith("at "))
                StoreName = StoreName.Substring(3);

            //Get price and Quantity
            float TempPrice, TempQuantity;

            switch (MarketType)
            {
                case MarketOrderType.Sell:
                    TempPrice = SafeFloat(Trade.SalePrice);
                    TempQuantity = SafeFloat(Trade.NumberAvailable);
                    break;

                case MarketOrderType.Buy:
                    TempPrice = SafeFloat(Trade.WantedPrice);
                    TempQuantity = SafeFloat(Trade.NumberWanted);
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(MarketType));
            }

            if (Trade.Tag == null)
            {
                Plugin.PluginLog.LogDebug(
                    $"[EcoMarketTools] Trade has no Tag. " +
                    $"ItemTypeID: {Trade.ItemTypeID}, " +
                    $"Item: {Trade.ReferencedItemMarkedUpName ?? ""}"
                );
            }

            // create offer
            MarketOffer Offer = new MarketOffer
            {
#pragma warning disable format
                // --- Order Information ---
                OrderType           = MarketType,
                Currency            = Trade.Currency?.Name ?? "",
                Price               = TempPrice,
                Quantity            = TempQuantity,
                // --- Item Information --
                ItemId              = Trade.ItemTypeID,
                ItemName            = StripEcoMarkup(Trade.ReferencedItemMarkedUpName ?? ""), // Referenece name from Trade, return "" if null, then strip name of mark up
                // --- Store Information ---
                StoreName           = StoreName,
                StorePosition       = new UnityEngine.Vector3(
                                            SafeFloat(Trade.StorePosition.x),
                                            SafeFloat(Trade.StorePosition.y),
                                            SafeFloat(Trade.StorePosition.z)
                                        ),
                StoreBalance        = SafeFloat(Trade.StoreBalance),
                LimitedFunds        = Trade.LimitedFunds,
                LimitedStorage      = Trade.LimitedStorage,
                Authorized          = Trade.Auth,
                // --- Order restrictions ---
                IsBarter            = Trade.IsBarter,
                IsWorldObjectSale   = Trade.IsWorldObjectSale,
                MinDurability       = SafeFloat(Trade.MinDurability),
                MaxDurability       = SafeFloat(Trade.MaxDurability),
                MinIntegrity        = SafeFloat(Trade.MinIntegrity),
                MaxIntegrity        = SafeFloat(Trade.MaxIntegrity),
                // --- Tag information ---
                TagId = Trade.Tag?.Id ?? 0 ,
                TagName = Trade.Tag?.Name ?? "" ,
                TagDisplayName = Trade.Tag?.DisplayName ?? "" ,
                TagIconName = Trade.Tag?.IconName ?? "" ,
                TagHidden = Trade.Tag?.Hidden ?? false ,
                TagVisibleInFilter = Trade.Tag?.IsVisibleInFilter ?? false ,
                TagVisibleInStore = Trade.Tag?.IsVisibleInStore ?? false ,
                // --- Geographic grouping Information ---
                SettlementName      = GetSettlementName(Trade)
#pragma warning restore format
            };

            return Offer;
        }

        //Grab settlement name from Store POS as the settlement info from Trade is unreliable
        private static string GetSettlementName(TradeTrackerView Trade)
        {
            // StorePosition -> PlotPos
            // Get live SettlementManagerView
            // LowestSettlementAtPos(PlotPos)
            // Return settlement name, or ""
            return "";
        }

        // Returns if trade is a valid sale offer
        private static bool IsValidSell( TradeTrackerView Trade)
        {
            return
                IsValidPrice(Trade.SalePrice) &&        // is Sale price a valid number
                Trade.NumberAvailable > 0;              // Does the Trade have at least 1 item avilable?
        }

        // Returns if trade is a valid buy offer
        private static bool IsValidBuy( TradeTrackerView Trade)
        {
            return
                IsValidPrice(Trade.WantedPrice) &&    // is Buy price a valid number
                Trade.NumberWanted > 0;              // Does the Trade have at least 1 item wanted?
        }

        // Checks if price in offer is a vlaid number to use
        private static bool IsValidPrice(float Price)
        {
            return
                !float.IsNaN(Price) &&       // does price exist?
                !float.IsInfinity(Price);    // is price Infinity (default value for Eco)
                // Price > 0 &&              // Is Buy price more than 0 // commented out as sales of 0 and negative value are valid (like garbage)
        }

        // Removes the Eco Markup characters from the string values to clean up data
        private static string StripEcoMarkup( string Value)
        {
            if (string.IsNullOrWhiteSpace(Value))
                return "";

            return Regex.Replace(Value, "<.*?>", "").Trim(); // use Regex to remove markup and trim extra space
        }

        // ensures that the float value is safe for use in plugin
        private static float SafeFloat( float Value)
        {
            if (float.IsNaN(Value))
                return 0f;

            if (float.IsInfinity(Value))
                return 0f;

            return Value;
        }
    }
}