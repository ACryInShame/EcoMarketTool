namespace EcoMarketTools
{
    public class MarketOfferDto
    {
        public int ItemId { get; set; }

        public string ItemName { get; set; } = "";

        public string Type { get; set; } = "";

        public float Price { get; set; }

        public float Quantity { get; set; }

        public string Currency { get; set; } = "";

        public string StoreName { get; set; } = "";

        public float X { get; set; }
        public float Y { get; set; }
        public float Z { get; set; }

        public float StoreBalance { get; set; }

        public bool LimitedFunds { get; set; }

        public bool LimitedStorage { get; set; }

        public bool Authorized { get; set; }
    }
}