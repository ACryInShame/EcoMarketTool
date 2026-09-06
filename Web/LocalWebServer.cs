using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Threading;
using UnityEngine;
using static Interop;

namespace EcoMarketTools
{
    public class LocalWebServer
    {
        private readonly HttpListener listener =
            new HttpListener();

        private Thread serverThread;

        private bool running;

        private const bool DevelopmentMode = true;

        private string WebIndexPath, WebAppPath, WebStylePath, WebTransportPath;


        public void Start()
        {
            if (running)
                return;

            if (DevelopmentMode)
            {
                string webRoot =Path.Combine(GetProjectPath(),"Web","Static");

                WebIndexPath =
                    Path.Combine(webRoot, "index.html");

                WebAppPath =
                    Path.Combine(webRoot, "app.js"); 

                WebStylePath =
                    Path.Combine(webRoot, "style.css");

                WebTransportPath =
                    Path.Combine(webRoot, "transport.js");
            }
            else
            {
                WebIndexPath =
                    "EcoMarketTools.Web.Static.index.html";

                WebAppPath =
                    "EcoMarketTools.Web.Static.app.js";

                WebStylePath =
                    "EcoMarketTools.Web.Static.style.css";
                WebTransportPath =
                    "EcoMarketTools.Web.Static.transport.js";
            }

            listener.Prefixes.Add(
                "http://127.0.0.1:8765/"
            );

            listener.Start();

            running = true;

            serverThread =
                new Thread(ServerLoop);

            serverThread.IsBackground = true;
            serverThread.Start();

            Plugin.PluginLog.LogInfo(
                "[EcoMarketTools] Local web server started at http://127.0.0.1:8765/"
            );
        }

        //allows us to change project path based on project file
        private string GetProjectPath()
        {
            var assembly = typeof(LocalWebServer).Assembly;

            foreach (
                var attribute in assembly.GetCustomAttributes<
                    System.Reflection.AssemblyMetadataAttribute>())
            {
                if (attribute.Key == "EcoProjectPath")
                    return attribute.Value ?? "";
            }

            return "";
        }

        public void Stop()
        {
            running = false;

            try
            {
                listener.Stop();
                listener.Close();
            }
            catch
            {
                // Ignore shutdown errors.
            }

            Plugin.PluginLog.LogInfo(
                "[EcoMarketTools] Local web server stopped."
            );
        }

        private void ServerLoop()
        {
            while (running)
            {
                try
                {
                    HttpListenerContext context =
                        listener.GetContext();

                    HandleRequest(context);
                }
                catch (HttpListenerException)
                {
                    if (!running)
                        return;
                }
                catch (ObjectDisposedException)
                {
                    return;
                }
                catch (Exception ex)
                {
                    Plugin.PluginLog.LogError(
                        $"[EcoMarketTools] Web server error: {ex}"
                    );
                }
            }
        }

        private void HandleRequest(
            HttpListenerContext context)
        {
            try
            {
                string path =
                    context.Request.Url?.AbsolutePath
                    ?? "/";

                // -------------------------
                // API
                // -------------------------

                if (path == "/api/offers")
                {
                    var offers =
                        MarketProbe.Instance.AllOffers
                            .Select(o => new MarketOfferDto
                            {
                                ItemId = o.ItemId,
                                ItemName = o.ItemName,
                                Type = o.Type.ToString(),

                                Price = o.Price,
                                Quantity = o.Quantity,

                                Currency = o.Currency,
                                StoreName = o.StoreName,

                                X = o.StorePosition.x,
                                Y = o.StorePosition.y,
                                Z = o.StorePosition.z,

                                StoreBalance =
                                    o.StoreBalance,

                                LimitedFunds =
                                    o.LimitedFunds,

                                LimitedStorage =
                                    o.LimitedStorage,

                                Authorized =
                                    o.Authorized
                            })
                            .ToList();

                    string json =
                        JsonSerializer.Serialize(offers);

                    WriteJson(
                        context,
                        json
                    );

                    return;
                }

                if (path == "/api/player")
                {
                    ServePlayer(
                        context
                    );

                    return;
                }

                // -------------------------
                // WEB FILES
                // -------------------------

                if (path == "/" ||
    path == "/index.html")
                {
                    ServeWebFile(
                        context,
                        WebIndexPath,
                        "text/html; charset=utf-8"
                    );

                    return;
                }

                if (path == "/app.js")
                {
                    ServeWebFile(
                        context,
                        WebAppPath,
                        "application/javascript; charset=utf-8"
                    );

                    return;
                }

                if (path == "/style.css")
                {
                    ServeWebFile(
                        context,
                        WebStylePath,
                        "text/css; charset=utf-8"
                    );

                    return;
                }

                if (
                    path ==
                    "/transport.js"
                )
                {
                    ServeWebFile(
                        context,
                        WebTransportPath,
                        "application/javascript"
                    );

                    return;
                }

                // -------------------------
                // NOT FOUND
                // -------------------------

                WriteText(
                    context,
                    "Not Found",
                    404
                );
            }
            catch (Exception ex)
            {
                Plugin.PluginLog.LogError(
                    $"[EcoMarketTools] Request failed: {ex}"
                );

                try
                {
                    WriteText(
                        context,
                        "Internal Server Error",
                        500
                    );
                }
                catch
                {
                    // Ignore response failure.
                }
            }
        }

        private void ServeEmbeddedFile(
            HttpListenerContext context,
            string resourceName,
            string contentType)
        {
            Assembly assembly =
                typeof(Plugin).Assembly;

            using Stream stream =
                assembly.GetManifestResourceStream(
                    resourceName
                );

            if (stream == null)
            {
                Plugin.PluginLog.LogWarning(
                    $"[EcoMarketTools] Embedded resource not found: {resourceName}"
                );

                WriteText(
                    context,
                    "File Not Found",
                    404
                );

                return;
            }

            using MemoryStream memoryStream =
                new MemoryStream();

            stream.CopyTo(memoryStream);

            byte[] buffer =
                memoryStream.ToArray();

            context.Response.StatusCode = 200;

            context.Response.ContentType =
                contentType;

            context.Response.ContentLength64 =
                buffer.Length;

            context.Response.OutputStream.Write(
                buffer,
                0,
                buffer.Length
            );

            context.Response.OutputStream.Close();
        }

        private void WriteText(
            HttpListenerContext context,
            string text,
            int statusCode = 200)
        {
            byte[] buffer =
                Encoding.UTF8.GetBytes(text);

            context.Response.StatusCode =
                statusCode;

            context.Response.ContentType =
                "text/plain; charset=utf-8";

            context.Response.ContentLength64 =
                buffer.Length;

            context.Response.OutputStream.Write(
                buffer,
                0,
                buffer.Length
            );

            context.Response.OutputStream.Close();
        }

        private void WriteJson(
            HttpListenerContext context,
            string json,
            int statusCode = 200)
        {
            byte[] buffer =
                Encoding.UTF8.GetBytes(json);

            context.Response.StatusCode =
                statusCode;

            context.Response.ContentType =
                "application/json; charset=utf-8";

            context.Response.ContentLength64 =
                buffer.Length;

            context.Response.OutputStream.Write(
                buffer,
                0,
                buffer.Length
            );

            context.Response.OutputStream.Close();
        }
        private void ServeWebFile(
                    HttpListenerContext context,
                    string path,
                    string contentType)
        {
            if (DevelopmentMode)
            {
                ServeDiskFile(
                    context,
                    path,
                    contentType
                );

                return;
            }

            ServeEmbeddedFile(
                context,
                path,
                contentType
            );
        }
        private void ServeDiskFile(
                    HttpListenerContext context,
                    string filePath,
                    string contentType)
        {
            if (!File.Exists(filePath))
            {
                Plugin.PluginLog.LogWarning(
                    $"[EcoMarketTools] Development web file not found: {filePath}"
                );

                WriteText(
                    context,
                    "File Not Found",
                    404
                );

                return;
            }

            byte[] buffer =
                File.ReadAllBytes(filePath);

            context.Response.StatusCode = 200;

            context.Response.ContentType =
                contentType;

            context.Response.ContentLength64 =
                buffer.Length;

            context.Response.OutputStream.Write(
                buffer,
                0,
                buffer.Length
            );

            context.Response.OutputStream.Close();
        }

        private void ServePlayer(
    HttpListenerContext context)
        {
            var probe =
                MarketProbe.Instance;

            var position =
                probe.PlayerPosition;

            var dto =
                new
                {
                    Name =
                        probe.PlayerName,

                    X =
                        position.x,

                    Y =
                        position.y,

                    Z =
                        position.z,

                    CurrentWeight =
                        0,

                    MaxWeight =
                        0
                };

            string json =
                JsonSerializer.Serialize(
                    dto
                );

            byte[] bytes =
                Encoding.UTF8.GetBytes(
                    json
                );

            context.Response.ContentType =
                "application/json";

            context.Response.ContentLength64 =
                bytes.Length;

            context.Response.OutputStream.Write(
                bytes,
                0,
                bytes.Length
            );

            context.Response.OutputStream.Close();
        }
    }
}