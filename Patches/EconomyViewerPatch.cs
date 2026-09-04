using HarmonyLib;

namespace EcoMarketTools
{
    [HarmonyPatch(
        typeof(EconomyViewerUI),
        nameof(EconomyViewerUI.Init)
    )]
    public static class EconomyViewerPatch
    {
        [HarmonyPostfix]
        public static void Postfix(
            EconomyViewerUI __instance)
        {
            Plugin.PluginLog.LogInfo(
                "[EcoMarketTools] Economy Viewer Init detected."
            );

            MarketProbe.Instance
                .PullMarketData(__instance);
        }
    }
}