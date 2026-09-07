using EcoMarketTools;
using HarmonyLib;
using System;

[HarmonyPatch(
    typeof(EconomyTrackerView), //class to hook to
    "set_Trades"                //method to hook to
)]
public static class EconomyTradesPatch
{
    [HarmonyPostfix]
    // Hook to run after EconomyTrackerView is updated
    public static void Postfix(
        EconomyTrackerView __instance)
    {
        try
        {
            Plugin.PluginLog.LogInfo(
                $"[EcoMarketTools] Economy Trades updated. " +
                $"Count: {__instance.Trades?.Count ?? 0}"
            );

            MarketProbe.Instance.PullMarketData(__instance);
        }
        catch (Exception Ex)
        {
            Plugin.PluginLog.LogError(
                $"[EcoMarketTools] Economy Trades update probe failed: {Ex}"
            );
        }
    }
}
