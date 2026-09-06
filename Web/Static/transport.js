// @ts-check

const TransportPlanner =
{
    saleOffers:
        [],

    buyOffers:
        [],

    playerInfo:
        null,

    origin:
        null,

    route:
        [],

    sortColumn:
        "ProfitPerDistance",

    sortAscending:
        false,


    // ---------------------------------
    // INITIALIZE
    // ---------------------------------

    async init()
    {
        this.bindEvents();

        await this.loadPlayerInfo();

        this.updateSummary();
    },


    // ---------------------------------
    // PLAYER INFO
    // ---------------------------------

    async loadPlayerInfo()
    {
        try
        {
            const response =
                await fetch(
                    "/api/player"
                );

            if (!response.ok)
            {
                console.warn(
                    "Player endpoint unavailable."
                );

                return;
            }

            this.playerInfo =
                await response.json();

            if (
                this.route.length === 0
            )
            {
                this.origin =
                {
                    Type:
                        "Player",

                    Name:
                        this.playerInfo.Name ||
                        "Current Player Position",

                    X:
                        this.playerInfo.X,

                    Y:
                        this.playerInfo.Y,

                    Z:
                        this.playerInfo.Z
                };
            }
        }
        catch (error)
        {
            console.warn(
                "Could not load player info:",
                error
            );
        }
    },


    // ---------------------------------
    // MAIN RENDER ENTRY
    // ---------------------------------

    render(
        saleOffers,
        buyOffers)
    {
        this.saleOffers =
            saleOffers;

        this.buyOffers =
            buyOffers;

        const routes =
            this.buildRoutes();

        const sortedRoutes =
            this.sortRoutes(
                routes
            );

        this.renderRoutes(
            sortedRoutes
        );

        this.updateSummary();
    },


    // ---------------------------------
    // BUILD ROUTES
    // ---------------------------------

    buildRoutes()
    {
        const routes = [];

        for (
            const source
            of this.saleOffers
        )
        {
            for (
                const destination
                of this.buyOffers
            )
            {
                if (
                    !this.sameItem(
                        source,
                        destination
                    )
                )
                {
                    continue;
                }

                if (
                    source.Currency !==
                    destination.Currency
                )
                {
                    continue;
                }

                if (
                    this.sameStore(
                        source,
                        destination
                    )
                )
                {
                    continue;
                }


                const profitPerItem =
                    destination.Price -
                    source.Price;

                if (
                    profitPerItem <= 0
                )
                {
                    continue;
                }


                const marketQuantity =
                    Math.min(
                        source.Quantity,
                        destination.Quantity
                    );

                if (
                    marketQuantity <= 0
                )
                {
                    continue;
                }


                const distanceToPickup =
                    this.origin
                    ?
                    this.getDistance(
                        this.origin,
                        source
                    )
                    :
                    0;


                const tradeDistance =
                    this.getDistance(
                        source,
                        destination
                    );


                const totalDistance =
                    distanceToPickup +
                    tradeDistance;


                const itemWeight =
                    this.getItemWeight(
                        source,
                        destination
                    );


                const carryQuantity =
                    this.getCarryQuantity(
                        itemWeight
                    );


                let tradeQuantity =
                    marketQuantity;


                if (
                    carryQuantity !==
                    null
                )
                {
                    tradeQuantity =
                        Math.min(
                            marketQuantity,
                            carryQuantity
                        );
                }


                const tripProfit =
                    profitPerItem *
                    tradeQuantity;


                let profitPerDistance =
                    0;


                if (
                    totalDistance > 0
                )
                {
                    profitPerDistance =
                        tripProfit /
                        totalDistance;
                }


                routes.push(
                    {
                        ItemId:
                            source.ItemId,

                        ItemName:
                            source.ItemName,

                        Currency:
                            source.Currency,

                        SourceStore:
                            source.StoreName,

                        DestinationStore:
                            destination.StoreName,

                        SourcePrice:
                            source.Price,

                        DestinationPrice:
                            destination.Price,

                        ProfitPerItem:
                            profitPerItem,

                        MarketQuantity:
                            marketQuantity,

                        ItemWeight:
                            itemWeight,

                        CarryQuantity:
                            carryQuantity,

                        TradeQuantity:
                            tradeQuantity,

                        TripProfit:
                            tripProfit,

                        DistanceToPickup:
                            distanceToPickup,

                        TradeDistance:
                            tradeDistance,

                        TotalDistance:
                            totalDistance,

                        ProfitPerDistance:
                            profitPerDistance,

                        SourceStatus:
                            getOfferStatus(
                                source
                            ),

                        DestinationStatus:
                            getOfferStatus(
                                destination
                            ),

                        SourceOffer:
                            source,

                        DestinationOffer:
                            destination
                    }
                );
            }
        }

        return routes;
    },


    // ---------------------------------
    // ITEM MATCH
    // ---------------------------------

    sameItem(
        source,
        destination)
    {
        if (
            source.ItemId !==
            undefined &&
            destination.ItemId !==
            undefined
        )
        {
            return (
                source.ItemId ===
                destination.ItemId
            );
        }

        return (
            source.ItemName ===
            destination.ItemName
        );
    },


    // ---------------------------------
    // STORE MATCH
    // ---------------------------------

    sameStore(
        source,
        destination)
    {
        if (
            source.StoreName !==
            destination.StoreName
        )
        {
            return false;
        }

        return (
            source.X ===
                destination.X &&
            source.Y ===
                destination.Y &&
            source.Z ===
                destination.Z
        );
    },


    // ---------------------------------
    // ITEM WEIGHT
    // ---------------------------------

    getItemWeight(
        source,
        destination)
    {
        if (
            Number.isFinite(
                source.ItemWeight
            ) &&
            source.ItemWeight > 0
        )
        {
            return source.ItemWeight;
        }

        if (
            Number.isFinite(
                destination.ItemWeight
            ) &&
            destination.ItemWeight > 0
        )
        {
            return destination.ItemWeight;
        }

        return null;
    },


    // ---------------------------------
    // CARRY CAPACITY
    // ---------------------------------

    getFreeCapacity()
    {
        if (
            !this.playerInfo
        )
        {
            return null;
        }

        const maxWeight =
            Number(
                this.playerInfo.MaxWeight
            );

        const currentWeight =
            Number(
                this.playerInfo.CurrentWeight
            );


        if (
            !Number.isFinite(
                maxWeight
            ) ||
            !Number.isFinite(
                currentWeight
            )
        )
        {
            return null;
        }

        return Math.max(
            0,
            maxWeight -
            currentWeight
        );
    },


    getCarryQuantity(
        itemWeight)
    {
        if (
            !itemWeight ||
            itemWeight <= 0
        )
        {
            return null;
        }


        const freeCapacity =
            this.getFreeCapacity();


        if (
            freeCapacity ===
            null
        )
        {
            return null;
        }


        return Math.floor(
            freeCapacity /
            itemWeight
        );
    },


    // ---------------------------------
    // DISTANCE
    // ---------------------------------

    getDistance(
        from,
        to)
    {
        const dx =
            to.X -
            from.X;

        const dy =
            to.Y -
            from.Y;

        const dz =
            to.Z -
            from.Z;


        return Math.sqrt(
            dx * dx +
            dy * dy +
            dz * dz
        );
    },


    // ---------------------------------
    // SORT
    // ---------------------------------

    sortRoutes(routes)
    {
        return [...routes]
            .sort(
                (a, b) =>
                {
                    let aValue =
                        a[
                            this.sortColumn
                        ];

                    let bValue =
                        b[
                            this.sortColumn
                        ];


                    if (
                        aValue === null ||
                        aValue === undefined
                    )
                    {
                        aValue = 0;
                    }


                    if (
                        bValue === null ||
                        bValue === undefined
                    )
                    {
                        bValue = 0;
                    }


                    if (
                        typeof aValue ===
                        "string"
                    )
                    {
                        aValue =
                            aValue
                                .toLowerCase();

                        bValue =
                            String(
                                bValue
                            )
                            .toLowerCase();
                    }


                    if (
                        aValue <
                        bValue
                    )
                    {
                        return this.sortAscending
                            ? -1
                            : 1;
                    }


                    if (
                        aValue >
                        bValue
                    )
                    {
                        return this.sortAscending
                            ? 1
                            : -1;
                    }


                    return 0;
                }
            );
    },


    // ---------------------------------
    // RENDER ROUTES
    // ---------------------------------

    renderRoutes(routes)
    {
        const tableBody =
            document.getElementById(
                "transportTableBody"
            );


        const count =
            document.getElementById(
                "transportCount"
            );


        if (
            !tableBody
        )
        {
            return;
        }


        tableBody.innerHTML =
            "";


        for (
            const route
            of routes
        )
        {
            const row =
                document.createElement(
                    "tr"
                );


            row.className =
                "transport-route-row";


            this.addCell(
                row,
                route.ItemName
            );


            this.addCell(
                row,
                route.Currency
            );


            this.addCell(
                row,
                route.SourceStore
            );


            this.addCell(
                row,
                formatNumber(
                    route.SourcePrice
                )
            );


            this.addCell(
                row,
                route.DestinationStore
            );


            this.addCell(
                row,
                formatNumber(
                    route.DestinationPrice
                )
            );


            this.addCell(
                row,
                formatNumber(
                    route.ProfitPerItem
                )
            );


            this.addCell(
                row,
                route.ItemWeight === null
                    ? "-"
                    : formatNumber(
                        route.ItemWeight
                    )
            );


            this.addCell(
                row,
                route.CarryQuantity === null
                    ? "-"
                    : formatNumber(
                        route.CarryQuantity
                    )
            );


            this.addCell(
                row,
                formatNumber(
                    route.TradeQuantity
                )
            );


            this.addCell(
                row,
                formatNumber(
                    route.TripProfit
                )
            );


            this.addCell(
                row,
                formatNumber(
                    route.DistanceToPickup
                )
            );


            this.addCell(
                row,
                formatNumber(
                    route.TradeDistance
                )
            );


            this.addCell(
                row,
                formatNumber(
                    route.TotalDistance
                )
            );


            this.addCell(
                row,
                formatNumber(
                    route.ProfitPerDistance
                )
            );


            this.addCell(
                row,
                route.SourceStatus
            );


            this.addCell(
                row,
                route.DestinationStatus
            );


            const actionCell =
                document.createElement(
                    "td"
                );


            const addButton =
                document.createElement(
                    "button"
                );


            addButton.type =
                "button";


            addButton.className =
                "transport-add-button";


            addButton.textContent =
                "Add To Route";


            addButton.addEventListener(
                "click",
                () =>
                {
                    this.selectRoute(
                        route
                    );
                }
            );


            actionCell.appendChild(
                addButton
            );


            row.appendChild(
                actionCell
            );


            tableBody.appendChild(
                row
            );
        }


        if (
            count
        )
        {
            count.textContent =
                `${routes.length} routes`;
        }
    },


    // ---------------------------------
    // SELECT ROUTE
    // ---------------------------------

    selectRoute(route)
    {
        this.route.push(
            route
        );


        this.origin =
        {
            Type:
                "Store",

            Name:
                route.DestinationStore,

            X:
                route.DestinationOffer.X,

            Y:
                route.DestinationOffer.Y,

            Z:
                route.DestinationOffer.Z
        };


        this.render(
            this.saleOffers,
            this.buyOffers
        );
    },


    // ---------------------------------
    // UNDO
    // ---------------------------------

    undoRoute()
    {
        if (
            this.route.length === 0
        )
        {
            return;
        }


        this.route.pop();


        if (
            this.route.length > 0
        )
        {
            const lastRoute =
                this.route[
                    this.route.length - 1
                ];


            this.origin =
            {
                Type:
                    "Store",

                Name:
                    lastRoute
                        .DestinationStore,

                X:
                    lastRoute
                        .DestinationOffer
                        .X,

                Y:
                    lastRoute
                        .DestinationOffer
                        .Y,

                Z:
                    lastRoute
                        .DestinationOffer
                        .Z
            };
        }
        else
        {
            this.resetOriginToPlayer();
        }


        this.render(
            this.saleOffers,
            this.buyOffers
        );
    },


    // ---------------------------------
    // RESET
    // ---------------------------------

    resetRoute()
    {
        this.route = [];

        this.resetOriginToPlayer();


        this.render(
            this.saleOffers,
            this.buyOffers
        );
    },


    resetOriginToPlayer()
    {
        if (
            this.playerInfo
        )
        {
            this.origin =
            {
                Type:
                    "Player",

                Name:
                    this.playerInfo.Name ||
                    "Current Player Position",

                X:
                    this.playerInfo.X,

                Y:
                    this.playerInfo.Y,

                Z:
                    this.playerInfo.Z
            };
        }
        else
        {
            this.origin =
                null;
        }
    },


    // ---------------------------------
    // SUMMARY
    // ---------------------------------

    updateSummary()
    {
        const originLabel =
            document.getElementById(
                "transportOrigin"
            );


        const routeSummary =
            document.getElementById(
                "transportRouteSummary"
            );


        const weightSummary =
            document.getElementById(
                "transportWeightSummary"
            );


        if (
            originLabel
        )
        {
            originLabel.textContent =
                this.origin
                    ?
                    this.origin.Name
                    :
                    "Player position unavailable";
        }


        if (
            weightSummary
        )
        {
            const freeCapacity =
                this.getFreeCapacity();


            if (
                freeCapacity === null
            )
            {
                weightSummary.textContent =
                    "Carry capacity unavailable";
            }
            else
            {
                weightSummary.textContent =
                    `${formatNumber(
                        freeCapacity
                    )} free weight`;
            }
        }


        if (
            !routeSummary
        )
        {
            return;
        }


        if (
            this.route.length === 0
        )
        {
            routeSummary.innerHTML =
                `
                <div class="transport-empty-route">
                    No route selected yet.
                </div>
                `;

            return;
        }


        let html = "";


        let totalDistance =
            0;


        const currencyProfits =
            new Map();


        for (
            let index = 0;
            index < this.route.length;
            index++
        )
        {
            const leg =
                this.route[index];


            totalDistance +=
                leg.TotalDistance;


            const oldProfit =
                currencyProfits.get(
                    leg.Currency
                ) || 0;


            currencyProfits.set(
                leg.Currency,
                oldProfit +
                leg.TripProfit
            );


            html += `
                <div class="transport-route-leg">
                    <strong>
                        ${index + 1}.
                        ${this.escapeHtml(
                            leg.ItemName
                        )}
                    </strong>

                    <span>
                        ${this.escapeHtml(
                            leg.SourceStore
                        )}
                        ?
                        ${this.escapeHtml(
                            leg.DestinationStore
                        )}
                    </span>

                    <span>
                        ${formatNumber(
                            leg.TripProfit
                        )}
                        ${this.escapeHtml(
                            leg.Currency
                        )}
                    </span>
                </div>
            `;
        }


        html += `
            <div class="transport-route-total">
                <strong>
                    Total Distance:
                </strong>

                ${formatNumber(
                    totalDistance
                )}
            </div>
        `;


        for (
            const [
                currency,
                profit
            ]
            of currencyProfits
        )
        {
            html += `
                <div class="transport-route-total">
                    <strong>
                        ${this.escapeHtml(
                            currency
                        )} Profit:
                    </strong>

                    ${formatNumber(
                        profit
                    )}
                </div>
            `;
        }


        routeSummary.innerHTML =
            html;
    },


    // ---------------------------------
    // EVENTS
    // ---------------------------------

    bindEvents()
    {
        const resetButton =
            document.getElementById(
                "transportResetButton"
            );


        const undoButton =
            document.getElementById(
                "transportUndoButton"
            );


        if (
            resetButton
        )
        {
            resetButton.addEventListener(
                "click",
                () =>
                {
                    this.resetRoute();
                }
            );
        }


        if (
            undoButton
        )
        {
            undoButton.addEventListener(
                "click",
                () =>
                {
                    this.undoRoute();
                }
            );
        }


        const headers =
            document.querySelectorAll(
                "th[data-route-sort]"
            );


        for (
            const header
            of headers
        )
        {
            header.addEventListener(
                "click",
                () =>
                {
                    const column =
                        header.dataset
                            .routeSort;


                    if (
                        this.sortColumn ===
                        column
                    )
                    {
                        this.sortAscending =
                            !this.sortAscending;
                    }
                    else
                    {
                        this.sortColumn =
                            column;

                        this.sortAscending =
                            false;
                    }


                    this.render(
                        this.saleOffers,
                        this.buyOffers
                    );
                }
            );
        }
    },


    // ---------------------------------
    // HELPERS
    // ---------------------------------

    addCell(
        row,
        value)
    {
        const cell =
            document.createElement(
                "td"
            );


        cell.textContent =
            value ?? "";


        row.appendChild(
            cell
        );
    },


    escapeHtml(value)
    {
        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            value ?? "";


        return div.innerHTML;
    }
};


window.TransportPlanner =
    TransportPlanner;