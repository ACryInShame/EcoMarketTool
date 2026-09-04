using UnityEngine;

namespace EcoMarketTools
{
    public enum MarketOrderType
    {
        Buy,
        Sell
    }

    public class MarketOffer
    {
        public int ItemId { get; set; }

        public string ItemName { get; set; } = "";
        public string ItemMarkedUpName { get; set; } = "";

        public MarketOrderType Type { get; set; }

        public string Currency { get; set; } = "";
        public float Price { get; set; }
        public float Quantity { get; set; }

        public string StoreName { get; set; } = "";
        public string StoreMarkedUpName { get; set; } = "";

        public string Settlement { get; set; } = "";
        public Vector3 StorePosition { get; set; }

        public float StoreBalance { get; set; }

        public bool LimitedFunds { get; set; }
        public bool LimitedStorage { get; set; }

        public bool Authorized { get; set; }
    }
}