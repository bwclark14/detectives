let db;
let currentDatabase = "people";

document.addEventListener("DOMContentLoaded", async () => {
    const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}` });
    db = new SQL.Database();
    createSampleDatabases();
    changeDatabase();
    clearQuery();
    document.getElementById("next-challenge-btn").addEventListener("click", nextChallenge);
    document.getElementById("clear-button").addEventListener("click", clearQuery);
});

function changeDatabase() {
    // Update the current database variable
    currentDatabase = document.getElementById("database-select").value;

    // Update the title to reflect the selected database
    document.getElementById("database-title").textContent = `${capitalizeFirstLetter(currentDatabase)} Database`;

    // Display tables associated with the selected database
    displayTable();
    populateFieldsButtons();

    // Reset challenge index to start from the beginning
    currentChallengeIndex = 0;

    // Load challenges based on the current database
    loadChallenge(currentDatabase); // Automatically load challenges based on the selected database
}

function createSampleDatabases() {
    // Create People table
    db.run(`CREATE TABLE people (surname TEXT, forename TEXT, eye_color TEXT, hair_color TEXT, shoe_size INTEGER, height INTEGER, month_of_birth TEXT, year_of_birth INTEGER);`);
    db.run(`
        INSERT INTO people VALUES 
            ('Brown', 'David', 'blue', 'brown', 8, 140, 'April', 2008),
            ('Miller', 'Sarah', 'hazel', 'red', 4, 95, 'May', 2016),
            ('Smith', 'John', 'green', 'black', 10, 180, 'February', 1990),
            ('Taylor', 'Emma', 'blue', 'blonde', 7, 130, 'July', 2005),
            ('Jones', 'Michael', 'brown', 'dark', 9, 150, 'December', 1995);
    `);
    
    // Create Cars table
    db.run(`CREATE TABLE cars (registration_no TEXT, make TEXT, model TEXT, fuel_type TEXT, body_style TEXT, owner_name TEXT, owner_city TEXT);`);
    db.run(`
        INSERT INTO cars VALUES 
            ('LN01 ABC', 'Ford', 'Focus', 'Petrol', 'Hatchback', 'Sophia Robinson', 'Brighton'),
            ('DV01 DEF', 'Vauxhall', 'Corsa', 'Diesel', 'Hatchback', 'James Turner', 'Birmingham'),
            ('XY12 ZZZ', 'Toyota', 'Corolla', 'Hybrid', 'Sedan', 'Alice Green', 'Liverpool'),
            ('AB34 CDE', 'Honda', 'Civic', 'Petrol', 'Coupe', 'Tom Brown', 'Manchester'),
            ('JK56 RST', 'BMW', 'X5', 'Diesel', 'SUV', 'Lisa White', 'London');
    `);
    
    // Create Products table
    db.run(`CREATE TABLE products (product_id INTEGER, name TEXT, category TEXT, price REAL, number_in_stock INTEGER);`);
    db.run(`
        INSERT INTO products VALUES 
            (1, 'Cordless Vacuum Cleaner', 'Home Appliances', 129.99, 20),
            (2, '4-Slice Toaster', 'Kitchen Appliances', 39.99, 15),
            (3, 'Electric Kettle', 'Kitchen Appliances', 29.99, 30),
            (4, 'Wireless Headphones', 'Electronics', 49.99, 25),
            (5, 'Smartphone', 'Electronics', 699.99, 10);
    `);
}

function displayTable() {
    const table = document.getElementById("data-table");
    table.innerHTML = ""; // Clear existing table content

    // Get the current database table data
    const data = db.exec(`SELECT * FROM ${currentDatabase} ORDER BY RANDOM() LIMIT 5`)[0];

    if (!data) {
        table.innerHTML = "<p>No data available.</p>";
        return;
    }

    const headers = data.columns;
    const numberOfFields = headers.length;

    // Check if fieldInfo already exists and remove it if it does
    const existingFieldInfo = document.getElementById("field-info");
    if (existingFieldInfo) {
        existingFieldInfo.remove();
    }

    // Create a new div for field information
    const fieldInfo = document.createElement('div');
    fieldInfo.id = "field-info";
    fieldInfo.style.border = '1px solid #000';
    fieldInfo.style.padding = '10px';
    fieldInfo.style.textAlign = 'center';
    fieldInfo.style.marginBottom = '10px';

    // Create text for number of fields and fields list
    const fieldCountText = `Number of fields: ${numberOfFields}`;
    const fieldListText = `Fields: ${headers.join(', ')}`;
    fieldInfo.innerHTML = `<strong>${fieldCountText}</strong><br><br><strong>${fieldListText}</strong>`;

    // Insert field information above the table
    table.parentNode.insertBefore(fieldInfo, table);

    // Create header row for the table
    const headerRow = table.insertRow();
    headers.forEach(header => {
        const cell = headerRow.insertCell();
        cell.textContent = header;
        cell.style.fontWeight = "bold";
    });

    // Insert data rows into the table
    data.values.forEach(row => {
        const rowElement = table.insertRow();
        row.forEach(cellData => {
            const cell = rowElement.insertCell();
            cell.textContent = cellData;
        });
    });
}

function populateFieldsButtons() {
    const fieldsContainer = document.getElementById("fields-buttons");
    fieldsContainer.innerHTML = "";

    const tableButtonsContainer = document.getElementById("table-buttons");
    tableButtonsContainer.innerHTML = "";

    let fields;
    let tableName;

    switch (currentDatabase) {
        case "people":
            fields = ["surname", "forename", "eye_color", "hair_color", "shoe_size", "height", "month_of_birth", "year_of_birth"];
            tableName = "people";
            break;
        case "cars":
            fields = ["registration_no", "make", "model", "fuel_type", "body_style", "owner_name", "owner_city"];
            tableName = "cars";
            break;
        case "products":
            fields = ["product_id", "name", "category", "price", "number_in_stock"];
            tableName = "products";
            break;
    }

    // Create a button for the table name
    const tableButton = document.createElement("button");
    tableButton.textContent = tableName;
    tableButton.onclick = () => appendSQL(tableName);
    tableButtonsContainer.appendChild(tableButton);

    // Create buttons for each field
    fields.forEach(field => {
        const button = document.createElement("button");
        button.textContent = field;
        button.onclick = () => appendSQL(field);
        fieldsContainer.appendChild(button);
        fieldsContainer.appendChild(document.createTextNode(" "));
    });
}

function clearQuery() {
    document.getElementById("sql-query").textContent = "";
    document.getElementById("record-message").textContent = "";
    document.getElementById("query-result").innerHTML = "";
    document.getElementById("result-message").textContent = "";
    const recordMessage = document.getElementById("record-message");
    if (recordMessage) {
        recordMessage.remove();
    }
    queryHistory = [];
}

let queryHistory = [];

function appendSQL(value) {
    const sqlQueryDiv = document.getElementById("sql-query");
    sqlQueryDiv.textContent += value + " ";
    queryHistory.push(value);
}

function deleteLastWord() {
    // Check if the queryHistory is already empty
    if (queryHistory.length === 0) {
        return; // Exit the function if there's nothing to delete
    }

    // Remove the last word from queryHistory and update the display
    queryHistory.pop();
    const newQuery = queryHistory.join(" ");
    document.getElementById("sql-query").textContent = newQuery.trim() + " ";
}

function addNumericValue() {
    const numInput = document.getElementById("number-input").value;
    appendSQL(numInput);
    document.getElementById("number-input").value = "";
}

function addTextValue() {
    const textInput = document.getElementById("text-input").value;
    const formattedText = `'${textInput}'`;
    appendSQL(formattedText);
    document.getElementById("text-input").value = "";
}

function executeQuery() {
    const query = document.getElementById("sql-query").textContent.trim();
    const resultMessage = document.getElementById("result-message");
    const resultTable = document.getElementById("query-result");
    resultTable.innerHTML = "";
    resultMessage.textContent = "";

    const existingRecordMessage = document.getElementById("record-message");
    if (existingRecordMessage) {
        existingRecordMessage.innerHTML = "";
    }

    try {
        const result = db.exec(query);
        if (!result || result.length === 0 || !result[0].values || result[0].values.length === 0) {
            resultMessage.textContent = "No results found for the query.";
            return;
        }

        const numRecords = result[0].values.length;
        const recordMessage = document.createElement("p");
        recordMessage.id = "record-message";
        recordMessage.textContent = `Found ${numRecords} record(s):`;
        resultTable.parentNode.insertBefore(recordMessage, resultTable);

        const headers = result[0].columns;
        const headerRow = resultTable.insertRow();
        headers.forEach(header => {
            const cell = headerRow.insertCell();
            cell.textContent = header;
            cell.style.fontWeight = "bold";
        });

        result[0].values.forEach(row => {
            const rowElement = resultTable.insertRow();
            row.forEach(cellData => {
                const cell = rowElement.insertCell();
                cell.textContent = cellData;
            });
        });

        resultMessage.textContent = "";
        scrollToQResults();
    } catch (e) {
        resultMessage.textContent = `Error executing query: ${e.message}`;
    }
}

function scrollToQResults() {
    const qResultsElement = document.getElementById("qresults");
    if (qResultsElement) {
        qResultsElement.scrollIntoView({ behavior: "smooth" });
    }
}

function toggleTable() {
    const tableContainer = document.querySelector('.table-container');
    const toggleButton = document.getElementById('toggle-table-button');

    if (tableContainer.style.display === "none") {
        tableContainer.style.display = "block";
        toggleButton.textContent = "Hide Table";
    } else {
        tableContainer.style.display = "none";
        toggleButton.textContent = "Show Table";
    }
}

const challenges = [
    // Challenges for the People table
    {
        table: "people",
        difficulty: "easy",
        question: "Retrieve all records from the 'people' table.",
        correctQuery: "SELECT * FROM people"
    },
    {
        table: "people",
        difficulty: "medium",
        question: "Count the number of records in the 'people' table.",
        correctQuery: "SELECT COUNT(*) FROM people"
    },
    {
        table: "people",
        difficulty: "medium",
        question: "Find the names of all people who have blue eyes.",
        correctQuery: "SELECT forename, surname FROM people WHERE eye_color = 'blue'"
    },
    {
        table: "people",
        difficulty: "hard",
        question: "Retrieve the surnames of people born after the year 2000.",
        correctQuery: "SELECT surname FROM people WHERE year_of_birth > 2000"
    },

    // Challenges for the Cars table
    {
        table: "cars",
        difficulty: "easy",
        question: "Retrieve all records from the 'cars' table.",
        correctQuery: "SELECT * FROM cars"
    },
    {
        table: "cars",
        difficulty: "medium",
        question: "Count the number of unique makes in the 'cars' table.",
        correctQuery: "SELECT COUNT(DISTINCT make) FROM cars"
    },
    {
        table: "cars",
        difficulty: "medium",
        question: "Find all cars owned by residents of Birmingham.",
        correctQuery: "SELECT * FROM cars WHERE owner_city = 'Birmingham'"
    },
    {
        table: "cars",
        difficulty: "hard",
        question: "Retrieve the distinct fuel types used in the 'cars' table.",
        correctQuery: "SELECT DISTINCT fuel_type FROM cars"
    },

    // Challenges for the Products table
    {
        table: "products",
        difficulty: "easy",
        question: "Retrieve all records from the 'products' table.",
        correctQuery: "SELECT * FROM products"
    },
    {
        table: "products",
        difficulty: "medium",
        question: "Find the total number of products in stock.",
        correctQuery: "SELECT SUM(number_in_stock) FROM products"
    },
    {
        table: "products",
        difficulty: "medium",
        question: "List the names of products that cost more than $50.",
        correctQuery: "SELECT name FROM products WHERE price > 50"
    },
    {
        table: "products",
        difficulty: "hard",
        question: "Retrieve the average price of products in the 'products' table.",
        correctQuery: "SELECT AVG(price) FROM products"
    }
];

let currentChallengeIndex = 0;

function loadChallenge() {
    const challengeContainer = document.getElementById("challenge-container");
    const filteredChallenges = challenges.filter(challenge => challenge.table === currentDatabase);
    if (filteredChallenges.length === 0) {
        challengeContainer.textContent = "No challenges available for the selected database.";
        return;
    }

    // Reset current challenge index if it exceeds the number of available challenges
    if (currentChallengeIndex >= filteredChallenges.length) {
        challengeContainer.textContent = "Challenge complete!";
        return;
    }

    challengeContainer.textContent = filteredChallenges[currentChallengeIndex].question;
}

document.addEventListener("DOMContentLoaded", () => {
    const sqlcDiv = document.getElementById("sqlc");
    sqlcDiv.style.display = "none";

    const challengeSection = document.createElement("div");
    challengeSection.id = "challenge-section";
    challengeSection.style.marginTop = "20px";
    challengeSection.innerHTML = `
        <h2>SQL Challenge</h2>
        <p id="challenge-container"></p>
        <button style="margin-bottom:10px; margin-top:10px;" class="run-query-button" onclick="checkChallenge()">
            Submit Challenge Answer
        </button>
        <p id="challenge-result"></p>
    `;
    sqlcDiv.appendChild(challengeSection);

    loadChallenge();

    const toggleButton = document.getElementById("toggle-sqlc");
    toggleButton.addEventListener("click", () => {
        if (sqlcDiv.style.display === "none") {
            sqlcDiv.style.display = "block";
            toggleButton.textContent = "Hide SQL Challenge";
        } else {
            sqlcDiv.style.display = "none";
            toggleButton.textContent = "Show SQL Challenge";
        }
    });
});

function checkChallenge() {
    const query = document.getElementById("sql-query").textContent.trim();
    const challengeResult = document.getElementById("challenge-result");

    const challenge = challenges.filter(challenge => challenge.table === currentDatabase)[currentChallengeIndex];
    if (!challenge) {
        challengeResult.textContent = "No challenge loaded.";
        return;
    }

    // Check if the user's query matches the correct query
    if (query.toLowerCase() === challenge.correctQuery.toLowerCase()) {
        challengeResult.textContent = "Correct! You've solved the challenge.";
      setTimeout(nextChallenge, 3000)
        
    } else {
        challengeResult.textContent = "Incorrect. Please try again.";
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function nextChallenge() {
    const filteredChallenges = challenges.filter(challenge => challenge.table === currentDatabase);
    
    if (currentChallengeIndex >= filteredChallenges.length - 1) {
        alert("Challenge complete!");
        return; // No more challenges available
    }
    
    // Increment the challenge index and loop back if at the end
    currentChallengeIndex++;
    loadChallenge(); // Load the next challenge
    document.getElementById("challenge-result").textContent = ""; // Clear previous results
}

function openTab(evt, tabName) {
    // Declare variables for all tab contents and tab buttons
    let i, tabcontent, tablinks;

    // Get all elements with class="tab-content" and hide them
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }

    // Get all elements with class="tab button" and remove the class "active"
    tablinks = document.getElementsByClassName("tab")[0].getElementsByTagName("button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Show the selected tab content and mark the clicked tab as active
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}


