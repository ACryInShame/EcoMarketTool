let allOffers = [];
let filteredOffers = [];

let sortColumn = "ItemName";
let sortDirection = 1;

const itemFilter =
    document.getElementById("itemFilter");

const typeFilter =
    document.getElementById("typeFilter");

const currencyFilter =
    document.getElementById("currencyFilter");

const storeFilter =
    document.getElementById("storeFilter");

const offerCount =
    document.getElementById("offerCount");

const tableBody =
    document.getElementById("offersTableBody");


async function loadOffers()
{
    try
    {
        const response =
            await fetch("/api/offers");

        if (!response.ok)
        {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        allOffers =
            await response.json();

        buildCurrencyFilter();

        applyFilters();
    }
    catch (error)
    {
        console.error(
            "Failed to load market offers:",
            error
        );

        offerCount.textContent =
            "Failed to load market data.";
    }
}


function buildCurrencyFilter()
{
    const currencies =
        [...new Set(
            allOffers
                .map(o => o.Currency)
                .filter(c => c)
        )]
        .sort((a, b) =>
            a.localeCompare(b)
        );

    for (const currency of currencies)
    {
        const option =
            document.createElement("option");

        option.value = currency;
        option.textContent = currency;

        currencyFilter.appendChild(option);
    }
}


function applyFilters()
{
    const itemSearch =
        itemFilter.value
            .trim()
            .toLowerCase();

    const selectedType =
        typeFilter.value;

    const selectedCurrency =
        currencyFilter.value;

    const storeSearch =
        storeFilter.value
            .trim()
            .toLowerCase();


    filteredOffers =
        allOffers.filter(offer =>
        {
            if (
                itemSearch &&
                !offer.ItemName
                    .toLowerCase()
                    .includes(itemSearch)
            )
            {
                return false;
            }

            if (
                selectedType &&
                offer.Type !== selectedType
            )
            {
                return false;
            }

            if (
                selectedCurrency &&
                offer.Currency !== selectedCurrency
            )
            {
                return false;
            }

            if (
                storeSearch &&
                !offer.StoreName
                    .toLowerCase()
                    .includes(storeSearch)
            )
            {
                return false;
            }

            return true;
        });


    sortOffers();

    renderOffers();
}


function sortOffers()
{
    filteredOffers.sort((a, b) =>
    {
        const valueA =
            a[sortColumn];

        const valueB =
            b[sortColumn];

        if (
            typeof valueA === "number" &&
            typeof valueB === "number"
        )
        {
            return (
                valueA - valueB
            ) * sortDirection;
        }

        return String(valueA)
            .localeCompare(
                String(valueB)
            ) * sortDirection;
    });
}


function renderOffers()
{
    tableBody.innerHTML = "";

    offerCount.textContent =
        `${filteredOffers.length} offers`;


    for (const offer of filteredOffers)
    {
        const row =
            document.createElement("tr");


        addCell(
            row,
            offer.ItemName
        );

        addCell(
            row,
            offer.Type
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


        tableBody.appendChild(row);
    }
}


function addCell(
    row,
    value)
{
    const cell =
        document.createElement("td");

    cell.textContent =
        value ?? "";

    row.appendChild(cell);
}


function formatNumber(value)
{
    if (
        value === null ||
        value === undefined
    )
    {
        return "";
    }

    return Number(value)
        .toLocaleString(
            undefined,
            {
                maximumFractionDigits: 4
            }
        );
}


function setupSorting()
{
    const headers =
        document.querySelectorAll(
            "th[data-sort]"
        );

    for (const header of headers)
    {
        header.addEventListener(
            "click",
            () =>
            {
                const column =
                    header.dataset.sort;

                if (
                    sortColumn === column
                )
                {
                    sortDirection *= -1;
                }
                else
                {
                    sortColumn = column;
                    sortDirection = 1;
                }

                applyFilters();
            }
        );
    }
}


itemFilter.addEventListener(
    "input",
    applyFilters
);

typeFilter.addEventListener(
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


setupSorting();

loadOffers();