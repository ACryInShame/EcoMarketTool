using UnityEngine;

namespace EcoMarketTools
{
    // --- MarketOrderType ---
    // Enum used by MarketOffer to define offer type
    public enum MarketOrderType
    {
        Buy,
        Sell
    }

    // --- MarketOffer ---
    // class to hold trade offer information
    public class MarketOffer
    {
        // --- Order Information ---
        public MarketOrderType OrderType { get; set; }

        public string Currency { get; set; } = "";
        public float Price { get; set; }
        public float Quantity { get; set; }

        // --- Item Information --
        public int ItemId { get; set; }
        public string ItemName { get; set; } = "";

        // --- Store Information ---
        public string StoreName { get; set; } = "";
        public Vector3 StorePosition { get; set; }
        public float StoreBalance { get; set; }

        public bool LimitedFunds { get; set; }
        public bool LimitedStorage { get; set; }
        public bool Authorized { get; set; }

        // --- Order restrictions ---
        public bool IsBarter { get; set; }
        public bool IsWorldObjectSale { get; set; }

        public float MinDurability { get; set; }
        public float MaxDurability { get; set; }

        public float MinIntegrity { get; set; }
        public float MaxIntegrity { get; set; }

        // --- Tag information ---
        public int TagId { get; set; }

        public string TagName { get; set; } = "";

        public string TagDisplayName { get; set; } = "";

        public string TagIconName { get; set; } = "";

        public bool TagHidden { get; set; }

        public bool TagVisibleInFilter { get; set; }

        public bool TagVisibleInStore { get; set; }

        // --- Geographic grouping Information ---
        public string SettlementName { get; set; } = "";

        /*
         * TODO: Move to MarketItemCache, referenced by ItemId.
         *
         * public string ItemIconName { get; set; } = "";
         * public bool ItemCanBeHeld { get; set; }
         * public bool ItemIsTool { get; set; }
         * public bool ItemIsConstructible { get; set; }
         * public bool ItemIsPlaceable { get; set; }
         * public bool ItemIsWaterPlaceable { get; set; }
         */

        /*
         * TODO: Settlement information should be cached/shared rather
         * than duplicated on every MarketOffer.
         *
         * Determine settlement(s) from StorePosition first.
         *
         * public string SettlementName { get; set; } = "";
         * public string SettlementType { get; set; } = "";
         * public bool SettlementHasAuth { get; set; }
         * public Vector3 SettlementPosition { get; set; }
         */
    }
}