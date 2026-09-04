using System.Collections.Generic;
using UnityEngine;

namespace EcoMarketTools
{
    public class MarketFilter
    {
        /*
         * Type = null means Buy and Sell.
        ItemId = null means all items.
        blank Currency means all currencies.
        blank StoreName means all stores.
        MaxDistance only applies if PlayerPosition is also supplied.
        ExcludedStores is for blocked shops.
        IncludedStores can later represent a shop groups. */

        public MarketOrderType? Type { get; set; }

        public int? ItemId { get; set; }

        public string ItemName { get; set; } = "";

        public string Currency { get; set; } = "";

        public string StoreName { get; set; } = "";

        public Vector3? PlayerPosition { get; set; }

        public float? MaxDistance { get; set; }

        public HashSet<string> ExcludedStores { get; set; }
            = new HashSet<string>();

        public HashSet<string> IncludedStores { get; set; }
            = new HashSet<string>();
    }
}