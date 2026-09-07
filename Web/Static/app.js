// @ts-check

let allOffers = [];

// Buy and Sale sort variables
let sortColumn = "ItemName";
let sortAscending = true;

// Compare sort variables
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

const saleTableBody =
    document.getElementById(
        "saleTableBody"
    );

const buyCount =
    document.getElementById(
        "buyCount"
    );

const saleCount =
    document.getElementById(
        "saleCount"
    );

const transportCurrencies =
    document.getElementById(
        "transportCurrencies"
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
                    Offer => Offer.ItemName
                )
                .filter(
                    Name => Name
                )
        )]
        .sort(
            (A, B) =>
                A.localeCompare(B)
        );

    itemFilter.innerHTML =
        '<option value="">All Items</option>';

    for (const Item of items)
    {
        const Option =
            document.createElement(
                "option"
            );

        Option.value =
            Item;

        Option.textContent =
            Item;

        itemFilter.appendChild(
            Option
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
                    Offer => Offer.Currency
                )
                .filter(
                    Currency => Currency
                )
        )]
        .sort(
            (A, B) =>
                A.localeCompare(B)
        );

    currencyFilter.innerHTML =
        '<option value="">All Currencies</option>';

    for (const Currency of currencies)
    {
        const Option =
            document.createElement(
                "option"
            );

        Option.value =
            Currency;

        Option.textContent =
            Currency;

        currencyFilter.appendChild(
            Option
        );
    }
}


// ---------------------------------
// PLAYER CREDIT
// ---------------------------------

function isPlayerCredit(Currency)
{
    if (!Currency)
    {
        return false;
    }

    return Currency
        .trim()
        .toLowerCase()
        .endsWith(
            " credit"
        );
}


// ---------------------------------
// OFFER STATUS
// ---------------------------------

function getOfferStatus(Offer)
{
    const Statuses = [];

    if (Offer.LimitedFunds)
    {
        Statuses.push(
            "Limited Funds"
        );
    }

    if (Offer.LimitedStorage)
    {
        Statuses.push(
            "Limited Storage"
        );
    }

    if (!Offer.Authorized)
    {
        Statuses.push(
            "Not Authorized"
        );
    }

    if (Statuses.length === 0)
    {
        return "Available";
    }

    return Statuses.join(", ");
}


// ---------------------------------
// FILTERING
// ---------------------------------

function applyFilters()
{
    const SelectedItem =
        itemFilter.value;

    const SelectedCurrency =
        currencyFilter.value;

    const StoreSearch =
        storeFilter.value
            .trim()
            .toLowerCase();

    const Filtered =
        allOffers.filter(
            Offer =>
            {
                if (
                    SelectedItem &&
                    Offer.ItemName !==
                    SelectedItem
                )
                {
                    return false;
                }

                if (
                    SelectedCurrency &&
                    Offer.Currency !==
                    SelectedCurrency
                )
                {
                    return false;
                }

                const StoreName =
                    (
                        Offer.StoreName ||
                        ""
                    )
                    .toLowerCase();

                if (
                    StoreSearch &&
                    !StoreName.includes(
                        StoreSearch
                    )
                )
                {
                    return false;
                }

                if (
                    hidePlayerCredit.checked &&
                    isPlayerCredit(
                        Offer.Currency
                    )
                )
                {
                    return false;
                }

                return true;
            }
        );


    // Eco Sale:
    // Store is selling -> Player buys from store.
    const SaleOffers =
        sortOffers(
            Filtered.filter(
                Offer =>
                    Offer.Type ===
                    "Sell"
            )
        );


    // Eco Buy:
    // Store is buying -> Player sells to store.
    const BuyOffers =
        sortOffers(
            Filtered.filter(
                Offer =>
                    Offer.Type ===
                    "Buy"
            )
        );


    renderNormalTable(
        saleTableBody,
        SaleOffers
    );

    renderNormalTable(
        buyTableBody,
        BuyOffers
    );


    // Compare tab
    renderTransportCurrencies(
        SaleOffers,
        BuyOffers
    );


    // Transport planner
    if (
        window.TransportPlanner
    )
    {
        TransportPlanner.render(
            SaleOffers,
            BuyOffers
        );
    }


    saleCount.textContent =
        `${SaleOffers.length} offers`;

    buyCount.textContent =
        `${BuyOffers.length} offers`;
}


// ---------------------------------
// NORMAL TABLE SORTING
// ---------------------------------

function sortOffers(Offers)
{
    return [...Offers]
        .sort(
            (A, B) =>
            {
                let AValue =
                    A[sortColumn];

                let BValue =
                    B[sortColumn];

                if (
                    typeof AValue ===
                    "string"
                )
                {
                    AValue =
                        AValue
                            .toLowerCase();

                    BValue =
                        (
                            BValue ||
                            ""
                        )
                        .toLowerCase();
                }

                if (
                    AValue <
                    BValue
                )
                {
                    return sortAscending
                        ? -1
                        : 1;
                }

                if (
                    AValue >
                    BValue
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


// ---------------------------------
// COMPARE SORTING
// ---------------------------------

function sortTransportOffers(Offers)
{
    return [...Offers]
        .sort(
            (A, B) =>
            {
                let AValue =
                    A[transportSortColumn];

                let BValue =
                    B[transportSortColumn];

                if (
                    typeof AValue ===
                    "string"
                )
                {
                    AValue =
                        AValue.toLowerCase();

                    BValue =
                        (
                            BValue ||
                            ""
                        )
                        .toLowerCase();
                }

                if (AValue < BValue)
                {
                    return transportSortAscending
                        ? -1
                        : 1;
                }

                if (AValue > BValue)
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
// BUY / SALE TABLES
// ---------------------------------

function renderNormalTable(
    TableBody,
    Offers)
{
    if (!TableBody)
    {
        return;
    }

    TableBody.innerHTML = "";

    for (const Offer of Offers)
    {
        const Row =
            document.createElement(
                "tr"
            );

        addCell(
            Row,
            Offer.ItemName
        );

        addCell(
            Row,
            formatNumber(
                Offer.Price
            )
        );

        addCell(
            Row,
            formatNumber(
                Offer.Quantity
            )
        );

        addCell(
            Row,
            Offer.Currency
        );

        addCell(
            Row,
            Offer.StoreName
        );

        addCell(
            Row,
            getOfferStatus(
                Offer
            )
        );

        TableBody.appendChild(
            Row
        );
    }
}


// ---------------------------------
// COMPARE
// ---------------------------------

function renderTransportCurrencies(
    SaleOffers,
    BuyOffers)
{
    if (!transportCurrencies)
    {
        return;
    }

    transportCurrencies.innerHTML =
        "";

    const Currencies =
        [...new Set(
            [
                ...SaleOffers.map(
                    Offer =>
                        Offer.Currency
                ),

                ...BuyOffers.map(
                    Offer =>
                        Offer.Currency
                )
            ]
            .filter(
                Currency =>
                    Currency
            )
        )]
        .sort(
            (A, B) =>
                A.localeCompare(B)
        );


    for (const Currency of Currencies)
    {
        const CurrencySaleOffers =
            sortTransportOffers(
                SaleOffers.filter(
                    Offer =>
                        Offer.Currency ===
                        Currency
                )
            );

        const CurrencyBuyOffers =
            sortTransportOffers(
                BuyOffers.filter(
                    Offer =>
                        Offer.Currency ===
                        Currency
                )
            );


        const Section =
            document.createElement(
                "section"
            );

        Section.className =
            "transport-currency";


        const Heading =
            document.createElement(
                "h2"
            );

        Heading.textContent =
            Currency;

        Section.appendChild(
            Heading
        );


        const Grid =
            document.createElement(
                "div"
            );

        Grid.className =
            "transport-grid";


        // -------------------------
        // SALE PANEL
        // Store selling / Buy From
        // -------------------------

        const SalePanel =
            document.createElement(
                "div"
            );

        SalePanel.innerHTML = `
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

        const SaleBody =
            SalePanel.querySelector(
                "tbody"
            );

        renderTransportTable(
            SaleBody,
            CurrencySaleOffers
        );


        // -------------------------
        // BUY PANEL
        // Store buying / Sell To
        // -------------------------

        const BuyPanel =
            document.createElement(
                "div"
            );

        BuyPanel.innerHTML = `
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

        const BuyBody =
            BuyPanel.querySelector(
                "tbody"
            );

        renderTransportTable(
            BuyBody,
            CurrencyBuyOffers
        );


        Grid.appendChild(
            SalePanel
        );

        Grid.appendChild(
            BuyPanel
        );

        Section.appendChild(
            Grid
        );

        transportCurrencies.appendChild(
            Section
        );
    }


    // Headers are dynamically created above.
    const TransportHeaders =
        transportCurrencies
            .querySelectorAll(
                "th[data-transport-sort]"
            );

    for (const Header of TransportHeaders)
    {
        Header.addEventListener(
            "click",
            () =>
            {
                const Column =
                    Header.dataset.transportSort;

                if (
                    transportSortColumn ===
                    Column
                )
                {
                    transportSortAscending =
                        !transportSortAscending;
                }
                else
                {
                    transportSortColumn =
                        Column;

                    transportSortAscending =
                        true;
                }

                applyFilters();
            }
        );
    }
}


// ---------------------------------
// COMPARE TABLE
// ---------------------------------

function renderTransportTable(
    TableBody,
    Offers)
{
    if (!TableBody)
    {
        return;
    }

    TableBody.innerHTML = "";

    for (const Offer of Offers)
    {
        const Row =
            document.createElement(
                "tr"
            );

        addCell(
            Row,
            Offer.ItemName
        );

        addCell(
            Row,
            formatNumber(
                Offer.Price
            )
        );

        addCell(
            Row,
            formatNumber(
                Offer.Quantity
            )
        );

        addCell(
            Row,
            Offer.StoreName
        );

        TableBody.appendChild(
            Row
        );
    }
}


// ---------------------------------
// TABLE HELPERS
// ---------------------------------

function addCell(
    Row,
    Value)
{
    const Cell =
        document.createElement(
            "td"
        );

    Cell.textContent =
        Value ?? "";

    Row.appendChild(
        Cell
    );
}


function formatNumber(Value)
{
    if (
        Value === null ||
        Value === undefined ||
        Number.isNaN(Value)
    )
    {
        return "";
    }

    return Number(Value)
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

const SortableHeaders =
    document.querySelectorAll(
        "th[data-sort]"
    );

for (const Header of SortableHeaders)
{
    Header.addEventListener(
        "click",
        () =>
        {
            const Column =
                Header.dataset.sort;

            if (
                sortColumn ===
                Column
            )
            {
                sortAscending =
                    !sortAscending;
            }
            else
            {
                sortColumn =
                    Column;

                sortAscending =
                    true;
            }

            applyFilters();
        }
    );
}


// ---------------------------------
// TAB SWITCHING
// ---------------------------------

const TabButtons =
    document.querySelectorAll(
        ".tab-button"
    );

const TabContents =
    document.querySelectorAll(
        ".tab-content"
    );

for (const Button of TabButtons)
{
    Button.addEventListener(
        "click",
        () =>
        {
            const Tab =
                Button.dataset.tab;

            for (const OtherButton of TabButtons)
            {
                OtherButton
                    .classList
                    .remove(
                        "active"
                    );
            }

            for (const Content of TabContents)
            {
                Content
                    .classList
                    .remove(
                        "active"
                    );
            }

            Button
                .classList
                .add(
                    "active"
                );

            const SelectedTab =
                document.getElementById(
                    `${Tab}Tab`
                );

            if (SelectedTab)
            {
                SelectedTab
                    .classList
                    .add(
                        "active"
                    );
            }
        }
    );
}


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