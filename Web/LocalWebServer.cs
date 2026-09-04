using System;
using System.Net;
using System.Text;
using System.Threading;
using System.Linq;
using System.Text.Json;

namespace EcoMarketTools
{
    public class LocalWebServer
    {
        private readonly HttpListener listener =
            new HttpListener();

        private Thread serverThread;

        private bool running;

        public void Start()
        {
            if (running)
                return;

            listener.Prefixes.Add(
                "http://127.0.0.1:8765/"
            );

            listener.Start();

            running = true;

            serverThread = new Thread(ServerLoop);
            serverThread.IsBackground = true;
            serverThread.Start();

            Plugin.PluginLog.LogInfo(
                "[EcoMarketTools] Local web server started at http://127.0.0.1:8765/"
            );
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

                if (path == "/")
                {
                    WriteText(
                        context,
                        "Eco Market Tools is running."
                    );

                    return;
                }
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

                                StoreBalance = o.StoreBalance,
                                LimitedFunds = o.LimitedFunds,
                                LimitedStorage = o.LimitedStorage,
                                Authorized = o.Authorized
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
    }
}