using HarmonyLib;

namespace EcoMarketTools
{
    [HarmonyPatch(
        typeof(EconomyViewerUI),        //class to hook to
        nameof(EconomyViewerUI.Init)    //method to hook to
    )]
    public static class EconomyViewerPatch
    {
        [HarmonyPostfix]
        // Hook to run after the Ecnomy View is opened
        public static void Postfix(
            EconomyViewerUI __instance)
        {
            Plugin.PluginLog.LogInfo(
                "[EcoMarketTools] Economy Viewer Init detected."
            );

            MarketProbe.Instance.PullMarketData(__instance.EconomyTrackerView);
        }
    }
}