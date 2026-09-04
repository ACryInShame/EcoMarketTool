using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace EcoMarketTools
{
    public static class MarketOfferConverter
    {
        public static IEnumerable<MarketOffer> Convert(
            TradeTrackerView trade)
        {
            if (trade == null)
                yield break;

            string rawItemName =
                trade.ReferencedItemMarkedUpName ?? "";

            string rawStoreName =
                trade.SourceName?.NotTranslated ?? "";

            string itemName =
                StripEcoMarkup(rawItemName);

            string storeName =
                StripEcoMarkup(rawStoreName);

            if (storeName.StartsWith("at "))
            {
                storeName =
                    storeName.Substring(3);
            }

            string currencyName =
                trade.Currency?.Name ?? "";

            if (IsValidSell(trade))
            {
                yield return new MarketOffer
                {
                    ItemId = trade.ItemTypeID,

                    ItemName = itemName,
                    ItemMarkedUpName = rawItemName,

                    Type = MarketOrderType.Sell,

                    Price = SafeFloat(trade.SalePrice),
                    Quantity = SafeFloat(trade.NumberAvailable),

                    Currency = currencyName,

                    StoreName = storeName,
                    StoreMarkedUpName = rawStoreName,

                    StorePosition = new UnityEngine.Vector3(
                                    SafeFloat(trade.StorePosition.x),
                                    SafeFloat(trade.StorePosition.y),
                                    SafeFloat(trade.StorePosition.z)
                                    ),

                    StoreBalance =
                        SafeFloat(trade.StoreBalance),

                    LimitedFunds =
                        trade.LimitedFunds,

                    LimitedStorage =
                        trade.LimitedStorage,

                    Authorized =
                        trade.Auth
                };
            }

            if (IsValidBuy(trade))
            {
                yield return new MarketOffer
                {
                    ItemId = trade.ItemTypeID,

                    ItemName = itemName,
                    ItemMarkedUpName = rawItemName,

                    Type = MarketOrderType.Buy,

                    Price = SafeFloat(trade.WantedPrice),
                    Quantity = SafeFloat(trade.NumberWanted),

                    Currency = currencyName,

                    StoreName = storeName,
                    StoreMarkedUpName = rawStoreName,

                    StorePosition = new UnityEngine.Vector3(
                                    SafeFloat(trade.StorePosition.x),
                                    SafeFloat(trade.StorePosition.y),
                                    SafeFloat(trade.StorePosition.z)
                                    ),

                    StoreBalance =
                        SafeFloat(trade.StoreBalance),

                    LimitedFunds =
                        trade.LimitedFunds,

                    LimitedStorage =
                        trade.LimitedStorage,

                    Authorized =
                        trade.Auth
                };
            }
        }

        private static bool IsValidSell(
            TradeTrackerView trade)
        {
            return
                !float.IsNaN(trade.SalePrice) &&
                !float.IsInfinity(trade.SalePrice) &&
                trade.SalePrice >= 0 &&
                trade.NumberAvailable >= 0;
        }

        private static bool IsValidBuy(
            TradeTrackerView trade)
        {
            return
                !float.IsNaN(trade.WantedPrice) &&
                !float.IsInfinity(trade.WantedPrice) &&
                trade.WantedPrice >= 0 &&
                trade.NumberWanted >= 0;
        }

        private static string StripEcoMarkup(
            string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return "";

            return Regex
                .Replace(value, "<.*?>", "")
                .Trim();
        }

        private static float SafeFloat(float value)
        {
            if (float.IsNaN(value))
                return 0f;

            if (float.IsInfinity(value))
                return 0f;

            return value;
        }
    }
}