using EcoMarketTools;
using HarmonyLib;

[HarmonyPatch(
    typeof(ActionBarUI),
    "UpdateWeights"
)]
public static class ActionBarPatch
{
    [HarmonyPostfix]
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

            MarketProbe.Instance
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