using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace EcoMarketTools
{
    public static class MarketService
    {
        public static List<MarketOffer> Filter(
            IEnumerable<MarketOffer> offers,
            MarketFilter filter)
        {
            if (offers == null)
                return new List<MarketOffer>();

            if (filter == null)
                return offers.ToList();

            IEnumerable<MarketOffer> query = offers;

            if (filter.Type.HasValue)
            {
                query = query.Where(
                    o => o.OrderType == filter.Type.Value
                );
            }

            if (filter.ItemId.HasValue)
            {
                query = query.Where(
                    o => o.ItemId == filter.ItemId.Value
                );
            }

            if (!string.IsNullOrWhiteSpace(filter.ItemName))
            {
                query = query.Where(
                    o => string.Equals(
                        o.ItemName,
                        filter.ItemName,
                        StringComparison.OrdinalIgnoreCase
                    )
                );
            }

            if (!string.IsNullOrWhiteSpace(
                filter.Currency))
            {
                query = query.Where(
                    o => string.Equals(
                        o.Currency,
                        filter.Currency,
                        StringComparison.OrdinalIgnoreCase
                    )
                );
            }

            if (!string.IsNullOrWhiteSpace(
                filter.StoreName))
            {
                query = query.Where(
                    o => string.Equals(
                        o.StoreName,
                        filter.StoreName,
                        StringComparison.OrdinalIgnoreCase
                    )
                );
            }

            if (filter.ExcludedStores.Count > 0)
            {
                query = query.Where(
                    o => !ContainsStore(
                        filter.ExcludedStores,
                        o.StoreName
                    )
                );
            }

            if (filter.IncludedStores.Count > 0)
            {
                query = query.Where(
                    o => ContainsStore(
                        filter.IncludedStores,
                        o.StoreName
                    )
                );
            }

            if (
                filter.PlayerPosition.HasValue &&
                filter.MaxDistance.HasValue
            )
            {
                Vector3 playerPosition =
                    filter.PlayerPosition.Value;

                float maxDistance =
                    filter.MaxDistance.Value;

                query = query.Where(
                    o =>
                        Vector3.Distance(
                            playerPosition,
                            o.StorePosition
                        ) <= maxDistance
                );
            }

            return query.ToList();
        }

        public static float GetDistance(
            MarketOffer offer,
            Vector3 playerPosition)
        {
            return Vector3.Distance(
                playerPosition,
                offer.StorePosition
            );
        }

        private static bool ContainsStore(
            IEnumerable<string> stores,
            string storeName)
        {
            return stores.Any(
                store =>
                    string.Equals(
                        store,
                        storeName,
                        StringComparison.OrdinalIgnoreCase
                    )
            );
        }
    }
}