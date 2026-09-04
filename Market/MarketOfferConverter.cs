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

                    Price = trade.SalePrice,
                    Quantity = trade.NumberAvailable,

                    Currency = currencyName,

                    StoreName = storeName,
                    StoreMarkedUpName = rawStoreName,

                    StorePosition =
                        trade.StorePosition,

                    StoreBalance =
                        trade.StoreBalance,

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

                    Price = trade.WantedPrice,
                    Quantity = trade.NumberWanted,

                    Currency = currencyName,

                    StoreName = storeName,
                    StoreMarkedUpName = rawStoreName,

                    StorePosition =
                        trade.StorePosition,

                    StoreBalance =
                        trade.StoreBalance,

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
    }
}