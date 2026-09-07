using EcoMarketTools;
using HarmonyLib;

namespace EcoMarketTools
{
    [HarmonyPatch(
    typeof(ActionBarUI), //class to hook to
    "UpdateWeights"     //method to hook to
    )]
    public static class ActionBarPatch
    {
        [HarmonyPostfix]
        // Hook to run after ActionBarUI is updated
        public static void Postfix(
            ActionBarUI __instance)
        {
            try
            {
                var weight =
                    __instance.weightComponent;

                if (weight == null)
                {
                    return;
                }

                PlayerProbe.Instance
                    .UpdatePlayerWeight(
                        weight.Weight,
                        weight.MaxWeight
                    );
            }
            catch (System.Exception ex)
            {
                Plugin.PluginLog.LogError(
                    $"[EcoMarketTools] Weight update failed: {ex}"
                );
            }
        }
    }
}