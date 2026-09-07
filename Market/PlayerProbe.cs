using UnityEngine;

namespace EcoMarketTools
{
    // --- PlayerProbe ---
    // responsibile for pulling Player information from Eco
    internal class PlayerProbe
    {
        // Singleton for PlayerProbe
        private static readonly PlayerProbe instance =
            new PlayerProbe();

        // Expose singleton in method to allow easier changes later
        public static PlayerProbe Instance
        {
            get { return instance; }
        }

        // --- Player information Variables ---
        public  string PlayerName { get; private set; } = "";

        public  Vector3 PlayerPosition { get; private set; }

        public  int PlayerCurrentWeight { get; private set; }

        public  int PlayerMaxWeight { get; private set; }

        // ---

        public void UpdatePlayerState()
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
    }
}
