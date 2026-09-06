// @ts-check

let allOffers = [];

// Buy and Sell sort variables
let sortColumn = "ItemName";
let sortAscending = true;

// Transport sorts variables
let transportSortColumn = "ItemName";
let transportSortAscending = true;


// ---------------------------------
// Element References from HTML
// ---------------------------------

const itemFilter =
    document.getElementById(
        "itemFilter"
    );

const currencyFilter =
    document.getElementById(
        "currencyFilter"
    );

const storeFilter =
    document.getElementById(
        "storeFilter"
    );

const hidePlayerCredit =
    document.getElementById(
        "hidePlayerCredit"
    );

const buyTableBody =
    document.getElementById(
        "buyTableBody"
    );

const sellTableBody =
    document.getElementById(
        "sellTableBody"
    );

const buyCount =
    document.getElementById(
        "buyCount"
    );

const sellCount =
    document.getElementById(
        "sellCount"
    );

const transportCurrencies =
    document.getElementById(
        "transportCurrencies"
    );

const transportTableBody =
document.getElementById(
    "transportTableBody"
);

const transportCount =
    document.getElementById(
        "transportCount"
    );


// ---------------------------------
// LOAD MARKET DATA
// ---------------------------------

async function loadOffers()
{
    try
    {
        const response =
            await fetch(
                "/api/offers"
            );

        if (!response.ok)
        {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        allOffers =
            await response.json();

        console.log(
            "Loaded offers:",
            allOffers.length
        );

        populateItems();

        populateCurrencies();

        applyFilters();
    }
    catch (error)
    {
        console.error(
            "Failed to load market offers:",
            error
        );
    }
}


// ---------------------------------
// ITEM DROPDOWN
// ---------------------------------

function populateItems()
{
    const items =
        [...new Set(
            allOffers
                .map(
                    o => o.ItemName
                )
                .filter(
                    name => name
                )
        )]
        .sort(
            (a, b) =>
                a.localeCompare(b)
        );

    itemFilter.innerHTML =
        '<option value="">All Items</option>';

    for (const item of items)
    {
        const option =
            document.createElement(
                "option"
            );

        option.value =
            item;

        option.textContent =
            item;

        itemFilter.appendChild(
            option
        );
    }
}


// ---------------------------------
// CURRENCY DROPDOWN
// ---------------------------------

function populateCurrencies()
{
    const currencies =
        [...new Set(
            allOffers
                .map(
                    o => o.Currency
                )
                .filter(
                    currency => currency
                )
        )]
        .sort(
            (a, b) =>
                a.localeCompare(b)
        );

    currencyFilter.innerHTML =
        '<option value="">All Currencies</option>';

    for (const currency of currencies)
    {
        const option =
            document.createElement(
                "option"
            );

        option.value =
            currency;

        option.textContent =
            currency;

        currencyFilter.appendChild(
            option
        );
    }
}


// ---------------------------------
// PLAYER CREDIT
// ---------------------------------

function isPlayerCredit(currency)
{
    if (!currency)
    {
        return false;
    }

    return currency
        .trim()
        .toLowerCase()
        .endsWith(
            " credit"
        );
}

// ---------------------------------
// Offer Status
// ---------------------------------

function getOfferStatus(offer)
{
    const statuses = [];

    if (offer.LimitedFunds)
    {
        statuses.push(
            "Limited Funds"
        );
    }

    if (offer.LimitedStorage)
    {
        statuses.push(
            "Limited Storage"
        );
    }

    if (!offer.Authorized)
    {
        statuses.push(
            "Not Authorized"
        );
    }

    if (statuses.length === 0)
    {
        return "Available";
    }

    return statuses.join(", ");
}

// ---------------------------------
// FILTERING
// ---------------------------------

function applyFilters()
{
    const selectedItem =
        itemFilter.value;

    const selectedCurrency =
        currencyFilter.value;

    const storeSearch =
        storeFilter.value
            .trim()
            .toLowerCase();

    const filtered =
        allOffers.filter(
            offer =>
            {
                if (
                    selectedItem &&
                    offer.ItemName !==
                    selectedItem
                )
                {
                    return false;
                }

                if (
                    selectedCurrency &&
                    offer.Currency !==
                    selectedCurrency
                )
                {
                    return false;
                }

                const storeName =
                    (
                        offer.StoreName ||
                        ""
                    )
                    .toLowerCase();

                if (
                    storeSearch &&
                    !storeName.includes(
                        storeSearch
                    )
                )
                {
                    return false;
                }

                if (
                    hidePlayerCredit.checked &&
                    isPlayerCredit(
                        offer.Currency
                    )
                )
                {
                    return false;
                }

                return true;
            }
        );


    const buyOffers =
        sortOffers(
            filtered.filter(
                offer =>
                    offer.Type ===
                    "Buy"
            )
        );

    const sellOffers =
        sortOffers(
            filtered.filter(
                offer =>
                    offer.Type ===
                    "Sell"
            )
        );


    renderNormalTable(
        buyTableBody,
        buyOffers
    );

    renderNormalTable(
        sellTableBody,
        sellOffers
    );

    //compare tab
    renderTransportCurrencies(
        sellOffers,
        buyOffers
    );

    //transport tab
    if (
        window.TransportPlanner
    )
    {
        TransportPlanner.render(
            sellOffers,
            buyOffers
        );
    }

    buyCount.textContent =
        `${buyOffers.length} offers`;

    sellCount.textContent =
        `${sellOffers.length} offers`;
}



// ---------------------------------
// SORTING
// ---------------------------------

function sortOffers(offers)
{
    return [...offers]
        .sort(
            (a, b) =>
            {
                let aValue =
                    a[sortColumn];

                let bValue =
                    b[sortColumn];

                if (
                    typeof aValue ===
                    "string"
                )
                {
                    aValue =
                        aValue
                            .toLowerCase();

                    bValue =
                        (
                            bValue ||
                            ""
                        )
                        .toLowerCase();
                }

                if (
                    aValue <
                    bValue
                )
                {
                    return sortAscending
                        ? -1
                        : 1;
                }

                if (
                    aValue >
                    bValue
                )
                {
                    return sortAscending
                        ? 1
                        : -1;
                }

                return 0;
            }
        );
}

function sortTransportOffers(offers)
{
    return [...offers]
        .sort(
            (a, b) =>
            {
                let aValue =
                    a[transportSortColumn];

                let bValue =
                    b[transportSortColumn];

                if (
                    typeof aValue === "string"
                )
                {
                    aValue =
                        aValue.toLowerCase();

                    bValue =
                        (bValue || "")
                            .toLowerCase();
                }

                if (aValue < bValue)
                {
                    return transportSortAscending
                        ? -1
                        : 1;
                }

                if (aValue > bValue)
                {
                    return transportSortAscending
                        ? 1
                        : -1;
                }

                return 0;
            }
        );
}


// ---------------------------------
// BUY / SELL TABLES
// ---------------------------------

function renderNormalTable(
    tableBody,
    offers)
{
    tableBody.innerHTML = "";

    for (const offer of offers)
    {
        const row =
            document.createElement(
                "tr"
            );

        addCell(
            row,
            offer.ItemName
        );

        addCell(
            row,
            formatNumber(
                offer.Price
            )
        );

        addCell(
            row,
            formatNumber(
                offer.Quantity
            )
        );

        addCell(
            row,
            offer.Currency
        );

        addCell(
            row,
            offer.StoreName
        );

        addCell(
            row,
            getOfferStatus(
                offer
            )
        );

        tableBody.appendChild(
            row
        );
    }
}


// ---------------------------------
// Compare
// ---------------------------------

function renderTransportCurrencies(
    sellOffers,
    buyOffers)
{
    transportCurrencies.innerHTML =
        "";

    const currencies =
        [...new Set(
            [
                ...sellOffers.map(
                    offer =>
                        offer.Currency
                ),

                ...buyOffers.map(
                    offer =>
                        offer.Currency
                )
            ]
            .filter(
                currency =>
                    currency
            )
        )]
        .sort(
            (a, b) =>
                a.localeCompare(b)
        );


    for (const currency of currencies)
    {
        const currencySellOffers =
            sortTransportOffers(
                sellOffers.filter(
                    offer =>
                        offer.Currency ===
                        currency
                )
            );

        const currencyBuyOffers =
            sortTransportOffers(
                buyOffers.filter(
                    offer =>
                        offer.Currency ===
                        currency
                )
            );


        const section =
            document.createElement(
                "section"
            );

        section.className =
            "transport-currency";


        const heading =
            document.createElement(
                "h2"
            );

        heading.textContent =
            currency;

        section.appendChild(
            heading
        );


        const grid =
            document.createElement(
                "div"
            );

        grid.className =
            "transport-grid";


        // -------------------------
        // SALE PANEL
        // -------------------------

        const sellPanel =
            document.createElement(
                "div"
            );

        sellPanel.innerHTML = `
            <h3>Sale (Buy From) Orders</h3>

            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th data-transport-sort="ItemName">
                                Item
                            </th>

                            <th data-transport-sort="Price">
                                Price
                            </th>

                            <th data-transport-sort="Quantity">
                                Qty
                            </th>

                            <th data-transport-sort="StoreName">
                                Store
                            </th>
                        </tr>
                    </thead>

                    <tbody></tbody>
                </table>
            </div>
        `;

        const sellBody =
            sellPanel.querySelector(
                "tbody"
            );

        renderTransportTable(
            sellBody,
            currencySellOffers
        );


        // -------------------------
        // BUY PANEL
        // -------------------------

        const buyPanel =
            document.createElement(
                "div"
            );

        buyPanel.innerHTML = `
            <h3>Buy (Sell To) Orders</h3>

            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th data-transport-sort="ItemName">
                                Item
                            </th>

                            <th data-transport-sort="Price">
                                Price
                            </th>

                            <th data-transport-sort="Quantity">
                                Qty
                            </th>

                            <th data-transport-sort="StoreName">
                                Store
                            </th>
                        </tr>
                    </thead>

                    <tbody></tbody>
                </table>
            </div>
        `;

        const buyBody =
            buyPanel.querySelector(
                "tbody"
            );

        renderTransportTable(
            buyBody,
            currencyBuyOffers
        );


        grid.appendChild(
            sellPanel
        );

        grid.appendChild(
            buyPanel
        );

        section.appendChild(
            grid
        );

        transportCurrencies
            .appendChild(
                section
            );
    }


    // ---------------------------------
    // COMPARE TABLE SORT EVENTS
    // ---------------------------------
    //
    // These headers are created above,
    // so attach the handlers AFTER all
    // currency sections exist.

    const transportHeaders =
        transportCurrencies
            .querySelectorAll(
                "th[data-transport-sort]"
            );

    for (const header of transportHeaders)
    {
        header.addEventListener(
            "click",
            () =>
            {
                const column =
                    header.dataset.transportSort;

                if (
                    transportSortColumn ===
                    column
                )
                {
                    transportSortAscending =
                        !transportSortAscending;
                }
                else
                {
                    transportSortColumn =
                        column;

                    transportSortAscending =
                        true;
                }

                applyFilters();
            }
        );
    }
}



function renderTransportTable(
    tableBody,
    offers)
{
    tableBody.innerHTML = "";

    for (const offer of offers)
    {
        const row =
            document.createElement(
                "tr"
            );

        addCell(
            row,
            offer.ItemName
        );

        addCell(
            row,
            formatNumber(
                offer.Price
            )
        );

        addCell(
            row,
            formatNumber(
                offer.Quantity
            )
        );

        addCell(
            row,
            offer.StoreName
        );

        tableBody.appendChild(
            row
        );
    }
}


// ---------------------------------
// TABLE HELPERS
// ---------------------------------

function addCell(
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
}


function formatNumber(value)
{
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(value)
    )
    {
        return "";
    }

    return Number(value)
        .toLocaleString(
            undefined,
            {
                maximumFractionDigits:
                    4
            }
        );
}


// ---------------------------------
// FILTER EVENTS
// ---------------------------------

itemFilter.addEventListener(
    "change",
    applyFilters
);

currencyFilter.addEventListener(
    "change",
    applyFilters
);

storeFilter.addEventListener(
    "input",
    applyFilters
);

hidePlayerCredit.addEventListener(
    "change",
    applyFilters
);


// ---------------------------------
// TABLE SORT EVENTS
// ---------------------------------

const sortableHeaders =
    document.querySelectorAll(
        "th[data-sort]"
    );

for (const header of sortableHeaders)
{
    header.addEventListener(
        "click",
        () =>
        {
            const column =
                header.dataset.sort;

            if (
                sortColumn ===
                column
            )
            {
                sortAscending =
                    !sortAscending;
            }
            else
            {
                sortColumn =
                    column;

                sortAscending =
                    true;
            }

            applyFilters();
        }
    );
}
/*
const routeHeaders =
    document.querySelectorAll(
        "th[data-route-sort]"
    );

for (const header of routeHeaders)
{
    header.addEventListener(
        "click",
        () =>
        {
            const column =
                header.dataset.routeSort;

            if (
                routeSortColumn ===
                column
            )
            {
                routeSortAscending =
                    !routeSortAscending;
            }
            else
            {
                routeSortColumn =
                    column;

                routeSortAscending =
                    true;
            }

            applyFilters();
        }
    );
}*/

// ---------------------------------
// TAB SWITCHING
// ---------------------------------

const tabButtons =
    document.querySelectorAll(
        ".tab-button"
    );

const tabContents =
    document.querySelectorAll(
        ".tab-content"
    );

for (const button of tabButtons)
{
    button.addEventListener(
        "click",
        () =>
        {
            const tab =
                button.dataset.tab;

            for (
                const otherButton
                of tabButtons
            )
            {
                otherButton
                    .classList
                    .remove(
                        "active"
                    );
            }

            for (
                const content
                of tabContents
            )
            {
                content
                    .classList
                    .remove(
                        "active"
                    );
            }

            button
                .classList
                .add(
                    "active"
                );

            const selectedTab =
                document.getElementById(
                    `${tab}Tab`
                );

            if (selectedTab)
            {
                selectedTab
                    .classList
                    .add(
                        "active"
                    );
            }
        }
    );
}
// ---------------------------------
// TRANSPORT ROUTES
// ---------------------------------
/*
function buildTransportRoutes(
    saleOffers,
    buyOffers)
{
    const routes = [];

    for (const source of saleOffers)
    {
        for (const destination of buyOffers)
        {
            // Must be the same item.
            if (
                source.ItemName !==
                destination.ItemName
            )
            {
                continue;
            }

            // Must use the same currency.
            if (
                source.Currency !==
                destination.Currency
            )
            {
                continue;
            }

            // No point transporting back
            // to the same store.
            if (
                source.StoreName ===
                destination.StoreName
            )
            {
                continue;
            }

            const profitPerItem =
                destination.Price -
                source.Price;

            // Only show profitable routes.
            if (
                profitPerItem <= 0
            )
            {
                continue;
            }

            const quantity =
                Math.min(
                    source.Quantity,
                    destination.Quantity
                );

            if (
                quantity <= 0
            )
            {
                continue;
            }

            const distance =
                getDistance(
                    source,
                    destination
                );

            routes.push(
                {
                    ItemName:
                        source.ItemName,

                    Currency:
                        source.Currency,

                    SourceStore:
                        source.StoreName,

                    SourcePrice:
                        source.Price,

                    DestinationStore:
                        destination.StoreName,

                    DestinationPrice:
                        destination.Price,

                    ProfitPerItem:
                        profitPerItem,

                    Quantity:
                        quantity,

                    PotentialProfit:
                        profitPerItem *
                        quantity,

                    Distance:
                        distance,

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
}


function getDistance(
    source,
    destination)
{
    const dx =
        destination.X -
        source.X;

    const dy =
        destination.Y -
        source.Y;

    const dz =
        destination.Z -
        source.Z;

    return Math.sqrt(
        dx * dx +
        dy * dy +
        dz * dz
    );
}


function sortTransportRoutes(
    routes)
{
    return [...routes]
        .sort(
            (a, b) =>
            {
                let aValue =
                    a[routeSortColumn];

                let bValue =
                    b[routeSortColumn];

                if (
                    typeof aValue ===
                    "string"
                )
                {
                    aValue =
                        aValue
                            .toLowerCase();

                    bValue =
                        (
                            bValue ||
                            ""
                        )
                        .toLowerCase();
                }

                if (
                    aValue <
                    bValue
                )
                {
                    return routeSortAscending
                        ? -1
                        : 1;
                }

                if (
                    aValue >
                    bValue
                )
                {
                    return routeSortAscending
                        ? 1
                        : -1;
                }

                return 0;
            }
        );
}


function renderTransportRoutes(
    saleOffers,
    buyOffers)
{
    if (
        !transportTableBody
    )
    {
        return;
    }

    const routes =
        sortTransportRoutes(
            buildTransportRoutes(
                saleOffers,
                buyOffers
            )
        );

    transportTableBody.innerHTML =
        "";

    for (const route of routes)
    {
        const row =
            document.createElement(
                "tr"
            );

        addCell(
            row,
            route.ItemName
        );

        addCell(
            row,
            route.Currency
        );

        addCell(
            row,
            route.SourceStore
        );

        addCell(
            row,
            formatNumber(
                route.SourcePrice
            )
        );

        addCell(
            row,
            route.DestinationStore
        );

        addCell(
            row,
            formatNumber(
                route.DestinationPrice
            )
        );

        addCell(
            row,
            formatNumber(
                route.ProfitPerItem
            )
        );

        addCell(
            row,
            formatNumber(
                route.Quantity
            )
        );

        addCell(
            row,
            formatNumber(
                route.Distance
            )
        );

        addCell(
            row,
            route.SourceStatus
        );

        addCell(
            row,
            route.DestinationStatus
        );

        transportTableBody
            .appendChild(
                row
            );
    }

    transportCount.textContent =
        `${routes.length} routes`;
}
*/

// ---------------------------------
// START
// ---------------------------------

async function startApp()
{
    if (
        window.TransportPlanner
    )
    {
        await TransportPlanner.init();
    }

    await loadOffers();
}

startApp();