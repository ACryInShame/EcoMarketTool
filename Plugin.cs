using BepInEx;
using BepInEx.Logging;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using System.Reflection;
using UnityEngine;


namespace EcoMarketTools
{
    [BepInPlugin(
        "com.ACryInShame.EcoMarketTools",
        "Eco Market Tools",
        "0.1.0"
    )]

    public class Plugin : BasePlugin
    {
        // Logs for Plugin
        internal static ManualLogSource PluginLog;

        // Used to hook into game methods
        private Harmony harmony;

        // used to host local web server
        private LocalWebServer webServer;


        public override void Load()
        {
            PluginLog = Log;

            PluginLog.LogInfo(
                "[EcoMarketTools] Client plugin loaded!"
            );

            harmony = new Harmony(
                "com.ACryInShame.EcoMarketTools"
            );

            harmony.PatchAll();

            PluginLog.LogInfo(
                "[EcoMarketTools] Harmony patches applied."
            );

            webServer = new LocalWebServer();
            webServer.Start();
        }
    }
}