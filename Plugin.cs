using BepInEx;
using BepInEx.Logging;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using System.Reflection;
using UnityEngine;


namespace EcoMarketTools
{
    [BepInPlugin(
        "com.lou.EcoMarketTools",
        "Eco Market Tools",
        "0.1.0"
    )]

    public class Plugin : BasePlugin
    {
        internal static ManualLogSource PluginLog;

        private Harmony harmony;

        private LocalWebServer webServer;


        public override void Load()
        {
            PluginLog = Log;

            Log.LogInfo(
                "[EcoMarketTools] Client plugin loaded!"
            );

            harmony = new Harmony(
                "com.lou.EcoMarketTools"
            );

            harmony.PatchAll();

            Log.LogInfo(
                "[EcoMarketTools] Harmony patches applied."
            );

            webServer = new LocalWebServer();
            webServer.Start();
        }
    }
}