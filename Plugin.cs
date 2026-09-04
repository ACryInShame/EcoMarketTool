using BepInEx;
using BepInEx.Logging;
using BepInEx.Unity.IL2CPP;

namespace EcoMarketTools
{
    [BepInPlugin(
        "com.lou.EcoMarketTools",
        "Eco Market Tools",
        "0.1.0"
    )]
    public class Plugin : BasePlugin
    {
        public override void Load()
        {
            Log.LogInfo("[EcoMarketTools] Client plugin loaded!");
        }
    }
}
