let db;
let currentDatabase = "people";
let currentChallengeIndex = 0;
let currentDifficulty = "easy"; // Default difficulty
let attempts = 0; // Track attempts per challenge

document.addEventListener("DOMContentLoaded", async () => {
    const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}` });
    db = new SQL.Database();
    createSampleDatabases();
    changeDatabase();
    clearQuery();

    document.getElementById("clear-button").addEventListener("click", clearQuery);
    document.getElementById("database-select").addEventListener("change", (event) => {
        currentDatabase = event.target.value;
        loadChallenge(); // Update challenge title and content
    });

    const toggleButton = document.getElementById("toggle-sqlc");
    toggleButton.addEventListener("click", toggleChallengeDisplay);
    
    loadChallenge(); // Load the first challenge on page load
});
/*document.addEventListener("DOMContentLoaded", async () => {
    const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}` });
    db = new SQL.Database();
    createSampleDatabases();
    changeDatabase();
    clearQuery();

    document.getElementById("clear-button").addEventListener("click", clearQuery);

    const toggleButton = document.getElementById("toggle-sqlc");
    toggleButton.addEventListener("click", toggleChallengeDisplay);
    
    loadChallenge(); // Load the first challenge on page load
});
*/


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
    fields = [
        "surname",       // Surname of the person
        "forename",      // Forename of the person
        "eye_colour",     // Eye color
        "hair_colour",    // Hair color
        "shoe_size",     // UK shoe size
        "height",        // Height in centimeters
        "month_of_birth",// Month of birth
        "year_of_birth", // Year of birth
        "age"            // Age of the person
    ];
    tableName = "people"; // Table name in the database
            break;
case "cars":
    fields = [
        "registration_no", 
        "make", 
        "model", 
        "fuel_type", 
        "body_style", 
        "colour",        // Added colour field
        "owner_name", 
        "owner_city", 
        "year_manufactured"  // Added year_manufactured field
    ];
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
    // Get the resultMessage and resultTable elements
    const resultMessage = document.getElementById("result-message");
    const resultTable = document.getElementById("query-result");

    // Clear various content elements
    document.getElementById("sql-query").textContent = "";
    document.getElementById("record-message").textContent = "";
    resultTable.innerHTML = ""; // Clear the query-result content
    resultMessage.textContent = ""; // Clear the result-message content

    // Remove record-message if it exists
    const recordMessage = document.getElementById("record-message");
    if (recordMessage) {
        recordMessage.remove();
    }

    // Clear query history and reset any other related elements
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

function toggleChallengeDisplay() {
    const sqlcDiv = document.getElementById("sqlc");
    const toggleButton = document.getElementById("toggle-sqlc");

    if (sqlcDiv.style.display === "none") {
        sqlcDiv.style.display = "block";
        toggleButton.textContent = "Hide SQL Challenge";
    } else {
        sqlcDiv.style.display = "none";
        toggleButton.textContent = "Show SQL Challenge";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const sqlcDiv = document.getElementById("sqlc");
    sqlcDiv.style.display = "none";

    const challengeSection = document.createElement("div");
    currentDatabase = document.getElementById("database-select").value;
challengeSection.id = "challenge-section";
challengeSection.style.marginTop = "0"; // Remove margin-top to prevent space below
challengeSection.innerHTML = `
    <!-- Container for heading and difficulty buttons -->
    <div style="display: flex; align-items: center; gap: 15px;">
        <h2 id="challenge-title" style="margin: 0; border-style:none;">SQL Challenge: ${currentDatabase} table</h2>
        
        <!-- Difficulty buttons next to the heading -->
        <div id="difficulty-buttons" style="display: flex; gap: 10px;">
            <button class="difficulty-button" data-difficulty="easy" style="font-size: 11pt; padding:0px 5px 0px 5px;">Lvl 1</button>
            <button class="difficulty-button" data-difficulty="medium" style="font-size: 11pt;padding:5px;">Lvl 2</button>
            <button class="difficulty-button" data-difficulty="hard" style="font-size: 11pt;padding:5px;">Lvl 3</button>
        </div>
    </div>

    <!-- Indicators below heading and difficulty buttons -->
    <div id="indicators" style="display: flex; gap: 5px; margin-top: 10px;"></div>

    <!-- Horizontal line -->
    <hr style="border: 1px solid #36d1dc;">
    
    <!-- Challenge container -->
    <p id="challenge-container"></p>
  
    <!-- Submit button and challenge result -->
    <button id="submitButton" style="margin-bottom:10px; margin-top:10px;" class="run-query-button" onclick="checkChallenge()">
        Submit Challenge Answer
    </button>
    <p id="challenge-result"></p>
`;

sqlcDiv.appendChild(challengeSection);

    const queryInputDiv = document.querySelector(".query-input");
    const originalParent = queryInputDiv.parentNode;

    // Create a placeholder div and insert it right after queryInputDiv
    const placeholder = document.createElement("div");
    placeholder.style.display = "none"; // Keep it hidden initially
    originalParent.insertBefore(placeholder, queryInputDiv.nextSibling);

    /*
    function moveQueryInputToChallenge() {
        // Hide placeholder and move queryInputDiv to challengeSection
        placeholder.style.display = "block";
        placeholder.style.height = "10px"; // Reserve height space if necessary
        challengeSection.appendChild(queryInputDiv);
    }

    function restoreQueryInputToOriginal() {
        // Move queryInputDiv back to its original position and hide placeholder
        originalParent.insertBefore(queryInputDiv, placeholder);
        placeholder.style.display = "none";
    }
    */

    function moveQueryInputToChallenge() {
    // Hide the 'Build Your SQL Query' div
    const buildDiv = document.getElementById("build");
    buildDiv.style.display = "none";  // Hide the div

    // Hide placeholder and move queryInputDiv to challengeSection
    placeholder.style.display = "block";
    placeholder.style.height = "10px"; // Reserve height space if necessary
    challengeSection.appendChild(queryInputDiv);
}

function restoreQueryInputToOriginal() {
    // Show the 'Build Your SQL Query' div
    const buildDiv = document.getElementById("build");
    buildDiv.style.display = "block";  // Show the div

    // Move queryInputDiv back to its original position and hide placeholder
    originalParent.insertBefore(queryInputDiv, placeholder);
    placeholder.style.display = "none";
}


    // Load initial challenge
    loadChallenge();


// Add event listeners for difficulty buttons
const difficultyButtons = document.querySelectorAll(".difficulty-button");
difficultyButtons.forEach(button => {
    button.addEventListener("click", (event) => {
        currentDifficulty = event.target.dataset.difficulty;
        currentChallengeIndex = 0; // Reset challenge index on difficulty change
        
        // Remove the 'selected' class from all buttons
        difficultyButtons.forEach(btn => btn.classList.remove("selected"));
        
        // Add the 'selected' class to the clicked button
        event.target.classList.add("selected");
        
        // Reset indicators and their state when difficulty changes
        resetIndicators(0); // Clear the indicators visually
        indicatorsState = []; // Reset indicators state
        loadChallenge(); // Load the first challenge for the new difficulty
    });
});


    const toggleButton = document.getElementById("toggle-sqlc");
    toggleButton.addEventListener("click", () => {
        if (sqlcDiv.style.display === "none") {
            sqlcDiv.style.display = "block";
            toggleButton.textContent = "Hide SQL Challenge";
            moveQueryInputToChallenge();
        } else {
            sqlcDiv.style.display = "none";
            toggleButton.textContent = "Show SQL Challenge";
            restoreQueryInputToOriginal();
        }
    });
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function openTab(evt, tabName) {
    let i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }

    tablinks = document.getElementsByClassName("tab")[0].getElementsByTagName("button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

function normalizeQuery(query) {
    return query
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .trim() // Trim leading/trailing spaces
        .toLowerCase(); // Convert to lowercase
}



let indicatorsState = []; // Track the state of indicators for each challenge

function loadChallenge() {
    // Update challenge title to include the current database name
    const challengeTitle = document.getElementById("challenge-title");
    challengeTitle.textContent = `SQL Challenge: ${currentDatabase} table`;
    
    const challengeContainer = document.getElementById("challenge-container");
    const filteredChallenges = challenges.filter(challenge =>
        challenge.table === currentDatabase && challenge.difficulty === currentDifficulty
    );

    if (filteredChallenges.length === 0) {
        challengeContainer.textContent = "No challenges available for the selected database and difficulty.";
        resetIndicators(0);
        return;
    }

    // Reset the number of indicators according to available challenges
    resetIndicators(filteredChallenges.length);

    if (currentChallengeIndex >= filteredChallenges.length) {
        challengeContainer.textContent = "Challenge complete!";
        return;
    }

    challengeContainer.textContent = filteredChallenges[currentChallengeIndex].question;

    // Reset attempts for the new challenge
    attempts = 0;

    // Load indicator state for current challenge or set to default (green or red)
    if (indicatorsState[currentChallengeIndex] !== undefined) {
        updateIndicator(currentChallengeIndex, false, indicatorsState[currentChallengeIndex]); // Persist the color
    } else {
        resetIndicators(filteredChallenges.length); // Only reset if state is undefined
    }

    updateIndicators(); // Update indicators based on the currentChallengeIndex
}




function checkChallenge() {
    const query = document.getElementById("sql-query").textContent.trim();
    const challengeResult = document.getElementById("challenge-result");
    const submitButton = document.getElementById("submitButton"); // Get the submit button

    const challenge = challenges
        .filter(challenge => challenge.table === currentDatabase && challenge.difficulty === currentDifficulty)[currentChallengeIndex];
    
    if (!challenge) {
        challengeResult.textContent = "No challenge loaded.";
        return;
    }

    const normalizedUserQuery = normalizeQuery(query);
    const normalizedCorrectQuery = normalizeQuery(challenge.correctQuery);

    if (normalizedUserQuery === normalizedCorrectQuery) {
        challengeResult.textContent = `Good job! Your query got us the results we need: "${query}"`;
        updateIndicator(currentChallengeIndex, true);
        indicatorsState[currentChallengeIndex] = "#66ff00"; // Mark as green on success
        setTimeout(nextChallenge, 3000);
    } else {
        attempts++;
        if (attempts === 1) {
            updateIndicator(currentChallengeIndex, false, "yellow");
            challengeResult.textContent = "Incorrect. You have 2 more attempts.";
        } else if (attempts === 2) {
            updateIndicator(currentChallengeIndex, false, "yellow");
            challengeResult.textContent = "Still incorrect. You have 1 more attempt.";
        } else {
            // Final attempt
            updateIndicator(currentChallengeIndex, false, "red"); // Set to red after three failed attempts
            indicatorsState[currentChallengeIndex] = "red"; // Store the red state
            challengeResult.textContent = "Incorrect. Moving to the next challenge.";

            // Hide the submit button after three failed attempts
            submitButton.style.display = "none";

            setTimeout(nextChallenge, 3000);
        }
    }
    clearQuery();
}



function nextChallenge() {
    const filteredChallenges = challenges.filter(
        challenge => challenge.table === currentDatabase && challenge.difficulty === currentDifficulty
    );

    if (currentChallengeIndex >= filteredChallenges.length - 1) {
        alert("Challenge complete!");
        return;
    }

    // Move to the next challenge
    currentChallengeIndex++;
    loadChallenge(); // Load the new challenge
    document.getElementById("challenge-result").textContent = ""; // Clear the result message
    
    // Reset attempts for the new challenge
    attempts = 0;

    // Re-show the submit button for the new challenge
    const submitButton = document.getElementById("submitButton");
    submitButton.style.display = "block";
}


function resetIndicators(count) {
    const indicatorsContainer = document.getElementById("indicators");
    indicatorsContainer.innerHTML = ""; // Clear previous indicators

    for (let i = 0; i < count; i++) {
        const indicator = document.createElement("div");
        indicator.classList.add("indicator");
        
        // Smaller dimensions for the circle
        indicator.style.width = "20px";
        indicator.style.height = "20px";
        
        indicator.style.borderRadius = "15%";
        indicator.style.backgroundColor = "#ccc";  // Default color (grey)
        indicator.style.border = "1px solid white";
        indicator.style.display = "flex";
        indicator.style.alignItems = "center";
        indicator.style.justifyContent = "center";
        indicator.style.color = "black";
        indicator.style.fontWeight = "bold";
        indicator.style.fontSize = "11px"; // Smaller font size

        // Set the number text inside the circle, starting at 1
        indicator.textContent = i + 1;

        indicatorsContainer.appendChild(indicator);
    }
}


/*
function resetIndicators(count) {
    const indicatorsContainer = document.getElementById("indicators");
    indicatorsContainer.innerHTML = ""; // Clear previous indicators

    for (let i = 0; i < count; i++) {
        const indicator = document.createElement("div");
        indicator.classList.add("indicator");
        indicator.style.width = "15px";
        indicator.style.height = "15px";
        indicator.style.borderRadius = "50%";
        indicator.style.backgroundColor = "#ccc";  // Default color (grey)
        indicator.style.border = "1px solid white";
        indicatorsContainer.appendChild(indicator);
    }
}
*/

function updateIndicators() {
    const indicators = document.querySelectorAll(".indicator");
    for (let i = 0; i < indicators.length; i++) {
        if (indicatorsState[i]) { // Check if there's a saved state
            indicators[i].style.backgroundColor = indicatorsState[i];
        } else if (i < currentChallengeIndex) {
            indicators[i].style.backgroundColor = "#66ff00"; // Mark completed challenges as green
        } else {
            indicators[i].style.backgroundColor = "#ccc"; // Default color for unattempted challenges
        }
    }
}


function updateIndicator(index, isCorrect, color) {
    const indicators = document.querySelectorAll(".indicator");
    if (color) {
        indicators[index].style.backgroundColor = color;
    } else if (isCorrect) {
        indicators[index].style.backgroundColor = "#66ff00";
    }
}



function createSampleDatabases() {
 // Create the "people" table with an additional column for "age"
db.run(`
  CREATE TABLE people (
    surname TEXT, 
    forename TEXT, 
    eye_colour TEXT, 
    hair_colour TEXT, 
    shoe_size INTEGER, 
    height INTEGER, 
    month_of_birth TEXT, 
    year_of_birth INTEGER,
    age INTEGER
  );
`);


// Insert updated values for each person with age calculated based on the current year (assuming it's 2024)
db.run(`
  INSERT INTO people VALUES 
    ('Brown', 'David', 'blue', 'brown', 8, 170, 'April', 1988, 36),
    ('Miller', 'Sarah', 'hazel', 'red', 4, 105, 'May', 2016, 8),
    ('Smith', 'John', 'green', 'black', 10, 180, 'February', 1990, 34),
    ('Baker', 'Emma', 'blue', 'blonde', 7, 160, 'July', 2005, 19),
    ('Jones', 'Michael', 'brown', 'dark', 9, 175, 'December', 1995, 28),
    ('Wilson', 'Lucy', 'brown', 'brown', 5, 110, 'March', 2012, 12),
    ('Davis', 'Jack', 'blue', 'brown', 9, 178, 'August', 1986, 38),
    ('Clark', 'Sophia', 'green', 'blonde', 6, 145, 'January', 2010, 14),
    ('Lewis', 'James', 'hazel', 'dark', 11, 182, 'September', 1980, 44),
    ('Walker', 'Grace', 'blue', 'red', 5, 135, 'June', 2008, 16),
    
    ('Robinson', 'Olivia', 'brown', 'brown', 7, 155, 'April', 2004, 20),
    ('Harris', 'Liam', 'green', 'black', 10, 183, 'November', 1992, 32),
    ('Baker', 'Charlotte', 'hazel', 'blonde', 6, 148, 'February', 2010, 14),
    ('Scott', 'George', 'blue', 'dark', 8, 168, 'May', 1998, 26),
    ('Moore', 'Isabella', 'brown', 'red', 5, 112, 'July', 2013, 11),

    ('Hall', 'Benjamin', 'green', 'brown', 9, 179, 'October', 1985, 39),
    ('Young', 'Amelia', 'hazel', 'blonde', 4, 118, 'March', 2015, 9),
    ('Allen', 'Henry', 'blue', 'black', 11, 185, 'August', 1994, 30),
    ('Wright', 'Ella', 'brown', 'red', 6, 150, 'December', 2009, 14),
    ('Green', 'Emily', 'blue', 'brown', 5, 120, 'June', 2014, 10),

    ('Adams', 'Jacob', 'hazel', 'brown', 8, 165, 'March', 1997, 27),
    ('Baker', 'Mia', 'green', 'blonde', 6, 140, 'September', 2007, 17),
    ('Nelson', 'Ethan', 'brown', 'dark', 10, 177, 'November', 1991, 33),
    ('Hill', 'Lily', 'blue', 'red', 4, 130, 'April', 2011, 13),
    ('Carter', 'Alexander', 'hazel', 'black', 11, 190, 'October', 1983, 41),

    ('Mitchell', 'Ava', 'green', 'brown', 7, 152, 'February', 2006, 18),
    ('Perez', 'Noah', 'blue', 'dark', 9, 175, 'July', 1993, 31),
    ('Roberts', 'Sophie', 'brown', 'red', 5, 122, 'May', 2013, 11),
    ('Turner', 'Lucas', 'hazel', 'black', 8, 165, 'June', 1999, 25),
    ('Phillips', 'Harper', 'blue', 'blonde', 4, 135, 'August', 2012, 12),
    ('Nguyen', 'An', 'brown', 'black', 9, 175, 'January', 1990, 34),
    ('Rodriguez', 'Carlos', 'hazel', 'dark', 10, 178, 'October', 1995, 29),
    ('Kumar', 'Priya', 'black', 'black', 5, 140, 'April', 2012, 12),
    ('Khan', 'Priya', 'black', 'black', 8, 165, 'June', 1999, 25),
    ('Khan', 'Amir', 'brown', 'black', 8, 165, 'March', 2001, 23),
    ('Yamamoto', 'Hana', 'brown', 'black', 6, 145, 'November', 2009, 15),

    ('Garcia', 'Isabella', 'green', 'dark', 6, 150, 'May', 2005, 19),
    ('Singh', 'Raj', 'brown', 'black', 9, 170, 'June', 1998, 26),
    ('Lee', 'Ji-Hyun', 'brown', 'dark', 5, 132, 'July', 2011, 13),
    ('Alvarez', 'Lucia', 'blue', 'brown', 6, 158, 'August', 2003, 21),
    ('Chen', 'Wei', 'black', 'black', 8, 172, 'February', 1997, 27),

    ('Omar', 'Zainab', 'brown', 'black', 5, 137, 'December', 2010, 13),
    ('Ibrahim', 'Omar', 'green', 'black', 10, 180, 'September', 1987, 37),
    ('Fernandez', 'Mateo', 'brown', 'dark', 8, 167, 'March', 2004, 20),
    ('Patel', 'Asha', 'black', 'black', 6, 143, 'May', 2007, 17),
    ('Kim', 'Soo-Jin', 'brown', 'dark', 9, 174, 'January', 1992, 32),

    ('Nakamura', 'Satoshi', 'black', 'black', 10, 182, 'April', 1994, 30),
    ('Gonzalez', 'Miguel', 'brown', 'dark', 8, 169, 'October', 2000, 24),
    ('Takahashi', 'Yuki', 'green', 'dark', 5, 133, 'July', 2012, 12),
    ('Martinez', 'Camila', 'blue', 'brown', 7, 155, 'August', 1999, 25),
    ('Ali', 'Fatima', 'brown', 'black', 5, 128, 'February', 2014, 10),
    ('Nowak', 'Kasia', 'brown', 'blonde', 6, 160, 'April', 2006, 18),
        ('Kowalski', 'Jakub', 'blue', 'brown', 8, 175, 'July', 1995, 29),
        ('Wojcik', 'Ania', 'green', 'black', 5, 150, 'March', 2010, 14),
        ('Lewandowski', 'Mateusz', 'brown', 'dark', 10, 180, 'January', 1988, 36),
        ('Szymanski', 'Ola', 'blue', 'blonde', 4, 125, 'September', 2013, 11),

        ('Baker', 'Ioana', 'hazel', 'black', 7, 158, 'May', 2000, 24),
        ('Ionescu', 'Andrei', 'blue', 'brown', 9, 170, 'October', 1992, 32),
        ('Stanescu', 'Elena', 'green', 'dark', 5, 140, 'February', 2011, 13),
        ('Marin', 'Victor', 'brown', 'black', 8, 165, 'December', 1994, 29),
        ('Dumitrescu', 'Mihai', 'hazel', 'brown', 10, 178, 'June', 1989, 35),
        ('Radu', 'Sofia', 'blue', 'blonde', 6, 153, 'August', 2008, 16),
         ('Brown', 'Oliver', 'green', 'black', 9, 177, 'May', 2012, 12),
        ('Brown', 'Chloe', 'blue', 'blonde', 7, 165, 'November', 2008, 16),
        ('Baker', 'Sophia', 'hazel', 'brown', 5, 140, 'August', 2014, 10),
        ('Miller', 'Ethan', 'blue', 'red', 8, 160, 'January', 2002, 22),
        
        ('Kowalski', 'Agnieszka', 'brown', 'dark', 6, 155, 'March', 2009, 15),
        ('Kowalski', 'Piotr', 'blue', 'black', 10, 180, 'December', 1986, 37),
        ('Ionescu', 'Raluca', 'green', 'blonde', 5, 145, 'April', 2015, 9),
        ('Ionescu', 'Vlad', 'brown', 'dark', 9, 173, 'September', 1991, 33),

        ('Nguyen', 'Lan', 'black', 'black', 6, 150, 'October', 2010, 14),
        ('Nguyen', 'Minh', 'brown', 'dark', 8, 168, 'February', 2003, 21),
        ('Brown', 'Lara', 'hazel', 'blonde', 5, 130, 'June', 2014, 10),
        ('Roberts', 'Simon', 'blue', 'dark', 11, 185, 'August', 1984, 40),
                ('Jones', 'David', 'brown', 'dark', 10, 180, 'December', 1988, 35),
        ('Miller', 'Sarah', 'hazel', 'brown', 8, 167, 'April', 1995, 29),

        ('Clark', 'John', 'blue', 'dark', 9, 175, 'November', 1984, 39),
        ('Lewis', 'Isabella', 'green', 'blonde', 5, 135, 'February', 2012, 12),
        ('Walker', 'Liam', 'brown', 'dark', 10, 182, 'September', 1990, 34),
        ('Robinson', 'Emily', 'hazel', 'red', 6, 150, 'June', 2014, 10),

        ('Harris', 'Amelia', 'blue', 'black', 8, 162, 'May', 2001, 23),
        ('King', 'Jack', 'brown', 'black', 7, 170, 'August', 2010, 14),
        ('Young', 'Ava', 'green', 'dark', 5, 140, 'April', 2013, 11),
        ('Wright', 'Henry', 'hazel', 'blonde', 10, 179, 'January', 1992, 32),

        ('Nguyen', 'Sofia', 'brown', 'black', 9, 176, 'February', 2004, 20),
        ('Davis', 'Noah', 'blue', 'dark', 6, 152, 'October', 2006, 17),
        ('Patel', 'Lily', 'green', 'black', 8, 164, 'September', 1995, 29);
    
`);

    
    // Create Cars table
// Create the updated cars table with 'colour' after 'body_style'
db.run(`
    CREATE TABLE cars (
        registration_no TEXT, 
        make TEXT, 
        model TEXT, 
        fuel_type TEXT, 
        body_style TEXT, 
        colour TEXT, 
        owner_name TEXT, 
        owner_city TEXT, 
        year_manufactured INTEGER
    );
`);

// Insert updated car records with realistic UK data and the requested fields
db.run(`
    INSERT INTO cars VALUES 
        -- Existing 5 records
        ('LN01 ABC', 'Ford', 'Focus', 'Petrol', 'Hatchback', 'Blue', 'Sophia Robinson', 'Brighton', 2015),
        ('DV01 DEF', 'Vauxhall', 'Corsa', 'Diesel', 'Hatchback', 'Red', 'James Turner', 'Birmingham', 2017),
        ('XY12 ZZZ', 'Toyota', 'Corolla', 'Hybrid', 'Saloon', 'Silver', 'Alice Green', 'Liverpool', 2019),
        ('AB34 CDE', 'Honda', 'Civic', 'Petrol', 'Coupe', 'Black', 'Tom Brown', 'Manchester', 2016),
        ('JK56 RST', 'BMW', 'X5', 'Diesel', 'SUV', 'White', 'Lisa White', 'London', 2020),
        ('KN20 BHG', 'Audi', 'A4', 'Diesel', 'Saloon', 'Black', 'Oliver Scott', 'Leeds', 2020),
        ('MX16 PQR', 'Nissan', 'Qashqai', 'Petrol', 'SUV', 'Grey', 'Emma Wilson', 'Bristol', 2016),
        ('PL65 ZYX', 'Volkswagen', 'Golf', 'Petrol', 'Hatchback', 'White', 'Jack Thompson', 'Nottingham', 2015),
        ('YD11 ABC', 'Mercedes', 'C-Class', 'Diesel', 'Saloon', 'Silver', 'Emily Davis', 'York', 2011),
        ('HK19 LFG', 'Hyundai', 'Tucson', 'Hybrid', 'SUV', 'Blue', 'Michael Harris', 'Oxford', 2019),
        ('GF14 HJK', 'Renault', 'Megane', 'Diesel', 'Estate', 'Red', 'Ella Moore', 'Newcastle', 2014),
        ('VX67 TUV', 'Peugeot', '3008', 'Diesel', 'SUV', 'Black', 'Noah Lewis', 'Sheffield', 2017),
        ('LT20 MNX', 'Kia', 'Sportage', 'Petrol', 'SUV', 'Green', 'Chloe Edwards', 'Cardiff', 2020),
        ('KW18 WTY', 'Skoda', 'Superb', 'Diesel', 'Estate', 'Grey', 'Harry Walker', 'Glasgow', 2018),
        ('BP13 GHJ', 'Mini', 'Cooper', 'Petrol', 'Hatchback', 'Yellow', 'Isabella Young', 'Leicester', 2013),
        ('SA55 HTD', 'Mazda', 'MX-5', 'Petrol', 'Convertible', 'Blue', 'George Hall', 'Bath', 2015),
        ('YM14 WRQ', 'Vauxhall', 'Astra', 'Diesel', 'Estate', 'White', 'Charlotte Wright', 'Coventry', 2014),
        ('BL67 ZVT', 'Jaguar', 'F-Pace', 'Petrol', 'SUV', 'Red', 'Oscar King', 'Edinburgh', 2017),
        ('CG21 YJU', 'Land Rover', 'Discovery', 'Diesel', 'SUV', 'Black', 'Lily Baker', 'Aberdeen', 2021),
        ('NS17 LDF', 'Volvo', 'V90', 'Diesel', 'Estate', 'Silver', 'Ethan Wood', 'Cambridge', 2017),
        ('MV18 UIQ', 'Tesla', 'Model S', 'Electric', 'Saloon', 'White', 'Amelia Martin', 'Milton Keynes', 2018),
        ('JP12 RET', 'Ford', 'Mondeo', 'Diesel', 'Saloon', 'Blue', 'Freddie Clark', 'Southampton', 2012),
        ('TG16 FDE', 'Fiat', '500', 'Petrol', 'Hatchback', 'Pink', 'Sophie Baker', 'Exeter', 2016),
        ('RJ15 GHK', 'BMW', '3 Series', 'Diesel', 'Saloon', 'Grey', 'Jacob Mitchell', 'Norwich', 2015),
        ('LK18 ASD', 'Mercedes', 'GLA', 'Hybrid', 'SUV', 'Silver', 'Harper Collins', 'Bournemouth', 2018),
        ('HT22 EFG', 'Honda', 'CR-V', 'Hybrid', 'SUV', 'Green', 'Archie Evans', 'Plymouth', 2022),
        ('WR10 XDF', 'Volkswagen', 'Passat', 'Diesel', 'Estate', 'Blue', 'Grace Morris', 'Gloucester', 2010),
        ('FM13 IJH', 'Audi', 'A3', 'Petrol', 'Hatchback', 'Red', 'Joseph Ward', 'Wolverhampton', 2013),
        ('YP19 VBN', 'Ford', 'Kuga', 'Diesel', 'SUV', 'White', 'Sebastian Parker', 'Stoke-on-Trent', 2019),
        ('GP14 KLJ', 'Peugeot', '208', 'Petrol', 'Hatchback', 'Black', 'Henry Reed', 'Luton', 2014),
        ('ZT12 HJY', 'Vauxhall', 'Insignia', 'Diesel', 'Saloon', 'Silver', 'Isla Russell', 'Hull', 2012),
        ('NW21 OIU', 'Tesla', 'Model X', 'Electric', 'SUV', 'White', 'Mia Stewart', 'Durham', 2021),
        ('HG15 RDL', 'Mazda', 'CX-5', 'Diesel', 'SUV', 'Red', 'Eleanor Hughes', 'Swansea', 2015),
        ('RS19 RPY', 'Jaguar', 'XE', 'Petrol', 'Saloon', 'Blue', 'Thomas Phillips', 'Reading', 2019),
        ('VN13 KLO', 'Honda', 'Jazz', 'Petrol', 'Hatchback', 'Yellow', 'Lucas Scott', 'Derby', 2013),
    ('LP11 GHI', 'Toyota', 'Yaris', 'Petrol', 'Hatchback', 'Blue', 'Holly Barnes', 'Birmingham', 2011),
    ('AK15 FDC', 'Volkswagen', 'Tiguan', 'Diesel', 'SUV', 'Black', 'Ben Marshall', 'Leeds', 2015),
    ('RJ18 HKN', 'Ford', 'Puma', 'Petrol', 'SUV', 'Red', 'Grace Hamilton', 'Liverpool', 2018),
    ('MP19 LMX', 'Nissan', 'Juke', 'Petrol', 'Hatchback', 'White', 'Daniel Griffin', 'Edinburgh', 2019),
    ('XY17 SDF', 'Audi', 'Q7', 'Diesel', 'SUV', 'Silver', 'Adam Hughes', 'Bristol', 2017),
    ('PL12 RQA', 'Hyundai', 'i30', 'Diesel', 'Hatchback', 'Grey', 'Sophie Taylor', 'Norwich', 2012),
    ('KP20 YTE', 'Kia', 'Picanto', 'Petrol', 'Hatchback', 'Yellow', 'Oliver Stevens', 'London', 2020),
    ('HB14 WLK', 'Peugeot', '5008', 'Diesel', 'SUV', 'Blue', 'Ella Gray', 'Bath', 2014),
    ('MW16 QET', 'Land Rover', 'Range Rover', 'Diesel', 'SUV', 'Green', 'Emily Saunders', 'Cambridge', 2016),
    ('BG10 HYR', 'BMW', '1 Series', 'Petrol', 'Hatchback', 'Black', 'William Fox', 'Sheffield', 2010),
    ('TS13 ZDR', 'Honda', 'Jazz', 'Petrol', 'Hatchback', 'Red', 'Ruby Foster', 'Manchester', 2013),
    ('VC19 PQR', 'Vauxhall', 'Mokka', 'Petrol', 'SUV', 'Grey', 'Lucas Carter', 'Newcastle', 2019),
    ('PY11 DSR', 'Mini', 'Countryman', 'Diesel', 'SUV', 'White', 'James Robinson', 'Brighton', 2011),
    ('RX18 TLM', 'Mazda', 'CX-3', 'Petrol', 'SUV', 'Red', 'Jacob Harrison', 'Oxford', 2018),
    ('KN20 LHP', 'Volvo', 'XC60', 'Hybrid', 'SUV', 'Blue', 'Mia Richardson', 'Cardiff', 2020),
    ('DF12 NGV', 'Mercedes', 'A-Class', 'Diesel', 'Hatchback', 'Silver', 'Ava Scott', 'Leicester', 2012),
    ('GF18 PVL', 'Renault', 'Clio', 'Petrol', 'Hatchback', 'Black', 'Henry Cooper', 'Southampton', 2018),
    ('TK15 VFS', 'Fiat', 'Panda', 'Petrol', 'Hatchback', 'Green', 'Grace Bell', 'Milton Keynes', 2015),
    ('BR17 ZKR', 'Ford', 'Fiesta', 'Petrol', 'Hatchback', 'Yellow', 'Isaac Howard', 'Coventry', 2017),
    ('LS16 NGP', 'Jaguar', 'XF', 'Diesel', 'Saloon', 'Grey', 'Ella Wood', 'Derby', 2016),
    ('SA11 BCD', 'Ford', 'Focus', 'Diesel', 'Hatchback', 'Blue', 'Emily Scott', 'Glasgow', 2011),
    ('ED12 CDF', 'Vauxhall', 'Astra', 'Petrol', 'Hatchback', 'Silver', 'James McDonald', 'Edinburgh', 2012),
    ('DU14 EFG', 'Toyota', 'Aygo', 'Petrol', 'Hatchback', 'Red', 'Sarah Campbell', 'Dundee', 2014),
    ('IN15 FGH', 'Honda', 'Civic', 'Diesel', 'Saloon', 'Black', 'David Robertson', 'Inverness', 2015),
    ('AB16 GHI', 'Volkswagen', 'Golf', 'Diesel', 'Hatchback', 'Grey', 'Anna Stewart', 'Aberdeen', 2016),
    ('PA17 HJK', 'BMW', '3 Series', 'Petrol', 'Saloon', 'Blue', 'Oliver Macleod', 'Paisley', 2017),
    ('ST18 JKL', 'Nissan', 'Qashqai', 'Diesel', 'SUV', 'White', 'Megan Fraser', 'Stirling', 2018),
    ('PE19 KLM', 'Mercedes', 'C-Class', 'Petrol', 'Saloon', 'Black', 'Jack Hamilton', 'Perth', 2019),
    ('KA11 LOP', 'Hyundai', 'i10', 'Petrol', 'Hatchback', 'Green', 'Grace Murray', 'Kilmarnock', 2011),
    ('DU13 MNO', 'Renault', 'Captur', 'Diesel', 'SUV', 'Red', 'Tom Wallace', 'Dundee', 2013),
    ('GL15 PQR', 'Audi', 'A4', 'Diesel', 'Saloon', 'White', 'Sophie Johnston', 'Glasgow', 2015),
    ('AB12 STU', 'Peugeot', '208', 'Petrol', 'Hatchback', 'Silver', 'Lucas Kerr', 'Aberdeen', 2012),
    ('IN14 VWX', 'Mazda', 'CX-5', 'Diesel', 'SUV', 'Blue', 'Ella Black', 'Inverness', 2014),
    ('PE16 XYZ', 'Skoda', 'Octavia', 'Diesel', 'Estate', 'Black', 'Harry Smith', 'Perth', 2016),
    ('KA17 BCA', 'Ford', 'Mondeo', 'Diesel', 'Saloon', 'Grey', 'George Cameron', 'Kilmarnock', 2017),
    ('DU19 DEF', 'Kia', 'Sportage', 'Petrol', 'SUV', 'White', 'Amelia Wilson', 'Dundee', 2019),
    ('GL12 GHI', 'Mini', 'Cooper', 'Petrol', 'Hatchback', 'Red', 'Daniel Paterson', 'Glasgow', 2012),
    ('ED14 JKL', 'Fiat', '500', 'Petrol', 'Hatchback', 'Blue', 'Charlotte Brown', 'Edinburgh', 2014),
    ('PA16 MNO', 'Volvo', 'XC90', 'Diesel', 'SUV', 'Black', 'William Gordon', 'Paisley', 2016),
    ('ST18 PQR', 'Ford', 'Fiesta', 'Petrol', 'Hatchback', 'Yellow', 'Jessica Anderson', 'Stirling', 2018),
    ('IN11 STU', 'Mercedes', 'GLA', 'Diesel', 'SUV', 'Silver', 'Emily Ross', 'Inverness', 2011),
    ('AB13 VWX', 'Toyota', 'Prius', 'Hybrid', 'Hatchback', 'White', 'Andrew Miller', 'Aberdeen', 2013),
    ('PA15 XYZ', 'Audi', 'A6', 'Diesel', 'Saloon', 'Grey', 'Hannah Robertson', 'Paisley', 2015),
    ('GL17 BCD', 'Vauxhall', 'Insignia', 'Diesel', 'Saloon', 'Blue', 'Matthew Hughes', 'Glasgow', 2017),
    ('ED19 EFG', 'Honda', 'HR-V', 'Petrol', 'SUV', 'Black', 'Emma Scott', 'Edinburgh', 2019),
    ('DU11 GHI', 'BMW', 'X1', 'Diesel', 'SUV', 'Silver', 'Alexander Sutherland', 'Dundee', 2011),
    ('IN13 JKL', 'Mazda', '3', 'Petrol', 'Hatchback', 'Red', 'Olivia Martin', 'Inverness', 2013),
    ('KA15 MNO', 'Ford', 'Kuga', 'Diesel', 'SUV', 'Green', 'Isabella Gray', 'Kilmarnock', 2015),
    ('AB18 PQR', 'Hyundai', 'Tucson', 'Diesel', 'SUV', 'White', 'Archie Reid', 'Aberdeen', 2018),
    ('PE19 STU', 'Nissan', 'Leaf', 'Electric', 'Hatchback', 'Blue', 'Sophia Cameron', 'Perth', 2019),
    ('HG23 EFG', 'Mini', 'Countryman', 'Petrol', 'SUV', 'White', 'Sophia Robinson', 'Brighton', 2016),
    
    ('LD10 HJK', 'BMW', '5 Series', 'Diesel', 'Saloon', 'Black', 'James Turner', 'Birmingham', 2010),
    ('BA17 PQR', 'Audi', 'Q7', 'Diesel', 'SUV', 'Silver', 'James Turner', 'Birmingham', 2017),

    ('FG12 JKL', 'Honda', 'Jazz', 'Petrol', 'Hatchback', 'Blue', 'Alice Green', 'Liverpool', 2012),

    ('DA15 XYZ', 'Ford', 'Kuga', 'Petrol', 'SUV', 'Grey', 'Tom Brown', 'Manchester', 2015),
    ('XE19 LMN', 'Tesla', 'Model 3', 'Electric', 'Saloon', 'Red', 'Tom Brown', 'Manchester', 2019),

    ('BC14 RST', 'Volkswagen', 'Passat', 'Diesel', 'Estate', 'Black', 'Lisa White', 'London', 2014),
    
 
    ('WE10 FGH', 'Fiat', 'Panda', 'Petrol', 'Hatchback', 'Silver', 'Emily Scott', 'Glasgow', 2010),
    ('YN16 QWE', 'Hyundai', 'Santa Fe', 'Diesel', 'SUV', 'Black', 'Emily Scott', 'Glasgow', 2016),


    ('ER18 XYZ', 'Skoda', 'Fabia', 'Petrol', 'Hatchback', 'White', 'James McDonald', 'Edinburgh', 2018),

    ('CF13 MNO', 'Nissan', 'Micra', 'Petrol', 'Hatchback', 'Red', 'Sarah Campbell', 'Dundee', 2013),
    

    ('MK17 GHI', 'Land Rover', 'Discovery', 'Diesel', 'SUV', 'Green', 'David Robertson', 'Inverness', 2017),
    

    ('BA11 QWE', 'Peugeot', '2008', 'Diesel', 'SUV', 'White', 'Anna Stewart', 'Aberdeen', 2011),
    ('OP18 XYZ', 'Jaguar', 'XF', 'Diesel', 'Saloon', 'Grey', 'Anna Stewart', 'Aberdeen', 2018),

    -- Oliver Macleod now owns 2 cars
    ('JA14 RST', 'Kia', 'Ceed', 'Petrol', 'Hatchback', 'Silver', 'Oliver Macleod', 'Paisley', 2014),

    -- Megan Fraser now owns 2 cars
    ('KL12 BCD', 'Ford', 'Fiesta', 'Petrol', 'Hatchback', 'Red', 'Megan Fraser', 'Stirling', 2012),

    -- Lucas Kerr now owns 3 cars
    ('PL09 HJK', 'BMW', '1 Series', 'Petrol', 'Hatchback', 'Black', 'Lucas Kerr', 'Aberdeen', 2009),
    ('ZY17 VWX', 'Audi', 'A3', 'Diesel', 'Hatchback', 'Blue', 'Lucas Kerr', 'Aberdeen', 2017);

`);

    
    // Create Products table
    db.run(`CREATE TABLE products (product_id INTEGER, name TEXT, category TEXT, price REAL, number_in_stock INTEGER);`);
    db.run(`
        INSERT INTO products VALUES 
            (1, 'Cordless Vacuum Cleaner', 'Appliances', 129.99, 20),
(2, '4-Slice Toaster', 'Kitchen', 39.99, 15),
(3, 'Electric Kettle', 'Kitchen', 29.99, 30),
(4, 'Wireless Headphones', 'Electronics', 49.99, 25),
(5, 'Smartphone', 'Electronics', 699.99, 10),
(6, 'Microwave Oven', 'Kitchen', 89.99, 12),
(7, 'Air Fryer', 'Kitchen', 79.99, 18),
(8, 'Smart TV', 'Electronics', 499.99, 8),
(9, 'Bluetooth Speaker', 'Electronics', 59.99, 22),
(10, 'Robot Vacuum Cleaner', 'Appliances', 299.99, 15),
(11, 'Electric Grill', 'Kitchen', 45.99, 25),
(12, 'Dishwasher', 'Appliances', 499.99, 5),
(13, 'Laptop', 'Electronics', 899.99, 10),
(14, 'Gaming Console', 'Electronics', 299.99, 8),
(15, 'Refrigerator', 'Appliances', 799.99, 7),
(16, 'Food Processor', 'Kitchen', 99.99, 20),
(17, 'Electric Slow Cooker', 'Kitchen', 39.99, 35),
(18, 'Washing Machine', 'Appliances', 399.99, 6),
(19, 'Tumble Dryer', 'Appliances', 499.99, 4),
(20, 'Air Conditioner', 'Appliances', 299.99, 10),
(21, 'Coffee Maker', 'Kitchen', 49.99, 30),
(22, 'Steam Iron', 'Appliances', 29.99, 40),
(23, 'Digital Camera', 'Electronics', 599.99, 9),
(24, 'Wireless Router', 'Electronics', 49.99, 25),
(25, 'Smartwatch', 'Electronics', 199.99, 15),
(26, 'Fitness Tracker', 'Electronics', 99.99, 20),
(27, 'Blender', 'Kitchen', 39.99, 30),
(28, 'Pressure Cooker', 'Kitchen', 89.99, 18),
(29, 'Stand Mixer', 'Kitchen', 199.99, 10),
(30, 'Electric Toothbrush', 'Personal Care', 79.99, 28),
(31, 'Hair Dryer', 'Personal Care', 39.99, 25),
(32, 'Electric Shaver', 'Personal Care', 59.99, 20),
(33, 'Portable Charger', 'Electronics', 19.99, 50),
(34, 'External Hard Drive', 'Electronics', 89.99, 15),
(35, 'VR Headset', 'Electronics', 299.99, 8),
(36, 'Wireless Earbuds', 'Electronics', 79.99, 22),
(37, 'Home Security Camera', 'Electronics', 149.99, 12),
(38, 'Smart Light Bulb', 'Home', 24.99, 40),
(39, 'Surge Protector', 'Electronics', 19.99, 35),
(40, 'Electric Blankets', 'Textiles', 49.99, 15),
(41, 'Bed Linen Set', 'Textiles', 39.99, 30),
(42, 'Cushions', 'Textiles', 19.99, 20),
(43, 'Wall Art', 'Decor', 29.99, 10),
(44, 'Dining Set', 'Furniture', 299.99, 5),
(45, 'Sofa', 'Furniture', 799.99, 3),
(46, 'Coffee Table', 'Furniture', 129.99, 7),
(47, 'Desk Lamp', 'Lighting', 39.99, 30),
(48, 'Bookshelf', 'Furniture', 149.99, 10),
(49, 'Air Purifier', 'Appliances', 199.99, 8),
(50, 'Hand Mixer', 'Kitchen', 29.99, 25),
(51, 'Ice Cream Maker', 'Kitchen', 79.99, 15),
(52, 'Deep Fryer', 'Kitchen', 99.99, 10),
(53, 'Pet Vacuum Cleaner', 'Appliances', 159.99, 12),
(54, 'Food Dehydrator', 'Kitchen', 89.99, 14),
(55, 'Suction Cup Phone Mount', 'Accessories', 9.99, 50),
(56, 'Smart Plug', 'Home', 19.99, 40),
(57, 'Corded Phone', 'Electronics', 29.99, 20),
(58, 'Digital Photo Frame', 'Electronics', 89.99, 10),
(59, 'Action Camera', 'Electronics', 199.99, 9),
(60, 'Mini Fridge', 'Appliances', 149.99, 6),
(61, 'Beverage Dispenser', 'Kitchen', 49.99, 18),
(62, 'Spiralizer', 'Kitchen', 19.99, 30),
(63, 'Pet Feeder', 'Pets', 49.99, 20),
(64, 'Dog Bed', 'Pets', 39.99, 15),
(65, 'Cat Tree', 'Pets', 89.99, 10),
(66, 'Garden Hose', 'Garden', 29.99, 25),
(67, 'Patio Heater', 'Garden', 199.99, 8),
(68, 'BBQ Grill', 'Outdoor', 299.99, 5),
(69, 'Camping Tent', 'Outdoor', 129.99, 12),
(70, 'Sleeping Bag', 'Outdoor', 39.99, 20),
(71, 'Waffle Maker', 'Kitchen', 49.99, 18),
(72, 'Oven Mitts', 'Kitchen', 19.99, 35),
(73, 'Cookware Set', 'Kitchen', 99.99, 15),
(74, 'Pasta Maker', 'Kitchen', 79.99, 10),
(75, 'Cookbook Holder', 'Kitchen', 29.99, 25),
(76, 'Non-stick Bakeware Set', 'Kitchen', 49.99, 12),
(77, 'Travel Mug', 'Kitchen', 19.99, 40),
(78, 'Gardening Gloves', 'Garden', 14.99, 50),
(79, 'Lawn Mower', 'Garden', 299.99, 4),
(80, 'Pressure Washer', 'Outdoor', 159.99, 6),
(81, 'Electric Grill Pan', 'Kitchen', 59.99, 15),
(82, 'Portable Air Purifier', 'Appliances', 99.99, 20),
(83, 'Instant Pot', 'Kitchen', 89.99, 12),
(84, 'Cordless Handheld Vacuum', 'Appliances', 49.99, 30),
(85, 'Nespresso Coffee Machine', 'Kitchen', 199.99, 8),
(86, 'Electric Frying Pan', 'Kitchen', 59.99, 25),
(87, 'Smart Thermostat', 'Home', 149.99, 10),
(88, 'LED Strip Lights', 'Lighting', 39.99, 22),
(89, 'Digital Kitchen Scale', 'Kitchen', 24.99, 35),
(90, 'Wall Mounted TV Bracket', 'Electronics', 49.99, 15),
(91, 'Foot Spa Massager', 'Personal Care', 79.99, 18),
(92, 'Handheld Steamer', 'Personal Care', 39.99, 20),
(93, 'Wireless Charging Pad', 'Electronics', 19.99, 40),
(94, 'Robot Mop', 'Appliances', 199.99, 5),
(95, 'Crock Pot', 'Kitchen', 59.99, 10),
(96, 'Clothes Drying Rack', 'Home', 29.99, 30),
(97, 'Shower Speaker', 'Electronics', 29.99, 25),
(98, 'Insulated Water Bottle', 'Kitchen', 24.99, 50),
(99, 'BBQ Tool Set', 'Outdoor', 49.99, 15),
(100, 'Garden Pruner', 'Garden', 19.99, 40),
(101, 'Inflatable Pool', 'Outdoor', 99.99, 10);
    `);
}

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

    // Reset indicators and their state when the database changes
    resetIndicators(0); // Clear the indicators visually
    indicatorsState = []; // Reset indicators state

    // Load challenges based on the current database
    loadChallenge(currentDatabase); // Automatically load challenges based on the selected database
}


function clearQuery() {
    document.getElementById("sql-query").textContent = "";
}

function normalizeQuery(query) {
    return query
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

const challenges = [
    // Challenges for the People table
    {
        table: "people",
        difficulty: "easy",
        question: "1. I need to know the number of people in the database. Show me all records from the 'people' table.",
        correctQuery: "SELECT * FROM people"
    },
    {
        table: "people",
        difficulty: "easy",
        question: "2. We need a list of everyone who is 29 years old.",
        correctQuery: "SELECT * FROM people WHERE age = 29"
    },
    {
        table: "people",
        difficulty: "easy",
        question: "3. Find everyone with a shoe size less than 6",
        correctQuery: "SELECT * FROM people WHERE shoe_size < 6"
    },
    {
        table: "people",
        difficulty: "easy",
        question: "4. How many people are taller than 175cm?",
        correctQuery: "SELECT * FROM people WHERE height > 175"
    },
    {
        table: "people",
        difficulty: "easy",
        question: "5. Find the names of all people who have brown hair.",
        correctQuery: "SELECT * FROM people WHERE hair_colour = 'brown'"
    },
    {
        table: "people",
        difficulty: "easy",
        question: "6. Provide me with a list of people who have birthdays in June.",
        correctQuery: "SELECT * FROM people WHERE month_of_birth = 'June'"
    },
    {
        table: "people",
        difficulty: "easy",
        question: "7. How may people are called Priya? Give me all the details.",
        correctQuery: "SELECT * FROM people WHERE forename = 'Priya'"
    },
    {
        table: "people",
        difficulty: "easy",
        question: "8. How may people have the last name Baker? Give me all the details.",
        correctQuery: "SELECT * FROM people WHERE surname = 'Baker'"
    },
    {
        table: "people",
        difficulty: "easy",
        question: "9. Create a list of everyone in alphabetical order of surname",
        correctQuery: "SELECT * FROM people ORDER BY surname ASC"
    },
    {
        table: "people",
        difficulty: "easy",
        question: "10. Who is the tallest person? Give me a list of everyone from tallest to shortest",
        correctQuery: "SELECT * FROM people ORDER BY height DESC"
    },
    // medium
    {
        table: "people",
        difficulty: "medium",
        question: "1. I just need the forenames and surnames of all the people in the database",
        correctQuery: "SELECT forename , surname FROM people"
    },
        {
        table: "people",
        difficulty: "medium",
        question: "2. List the forenames and hair colours of people who wear shoes larger than size 8.",
        correctQuery: "SELECT forename , hair_colour FROM people WHERE shoe_size > 8"
    },
        {
        table: "people",
        difficulty: "medium",
        question: "3. Get the surnames, forenames and ages of people born in March.",
        correctQuery: "SELECT surname , forename , age FROM people WHERE month_of_birth = \'March\'"
    },
    {
        table: "people",
        difficulty: "medium",
        question: "4. Can you show me only the surnames of people who have blue eyes?",
        correctQuery: "SELECT surname FROM people WHERE eye_colour = \'blue\'"
    },
        {
        table: "people",
        difficulty: "medium",
        question: "5. Show me the forenames and shoe sizes of people who are younger than 18.",
        correctQuery: "SELECT forename , shoe_size FROM people WHERE age < 18"
    },


    {
        table: "people",
        difficulty: "medium",
        question: "6. I want to know the surnames, heights and eye colours of people who are exactly 25 years old.",
        correctQuery: "SELECT surname , height , eye_colour FROM people WHERE age = 25"
    },

    {
        table: "people",
        difficulty: "medium",
        question: "7. I need to see the surnames and shoe sizes of people with black hair, ordered by their shoe size from smalles to largest.",
        correctQuery: "SELECT surname , shoe_size FROM people WHERE hair_colour = \'black\' ORDER BY shoe_size ASC"
    },
    {
        table: "people",
        difficulty: "medium",
        question: "8. Can you provide the forenames and shoe sizes of people who have a shoe size of 8 OR have hazel eyes?",
        correctQuery: "SELECT forename , shoe_size FROM people WHERE shoe_size = 7 OR eye_colour = \'hazel\'"
    },

    {
        table: "people",
        difficulty: "medium",
        question: "9. I want a list of forenames, surnames, eye colours and ages of everyone ordered by the oldest person first.",
        correctQuery: "SELECT forename , surname , eye_colour , age FROM people ORDER BY age DESC"
    },
        {
        table: "people",
        difficulty: "medium",
        question: "10. Give me all the details of people who over 26 years old with black hair.",
        correctQuery: "SELECT * FROM people WHERE age > 26 AND hair_colour = \'black\'"
    },
        {
        table: "people",
        difficulty: "hard",
        question: "1. Give me all the details of people who are shorter than 160cm OR have feet larger than a 9",
        correctQuery: "SELECT * FROM people WHERE height < 160 OR shoe_size > 9"
    },
        {
        table: "people",
        difficulty: "hard",
        question: "2. Give me the surnames, heights and shoe sizes of people who are taller than 170 cm or who have feet smaller than 5.",
        correctQuery: "SELECT surname , height , shoe_size FROM people WHERE height > 170 OR shoe_size < 5"
    },
           {
        table: "people",
        difficulty: "hard",
        question: "3. Give me the forenames, surnames and ages of people who are born in March or April.",
        correctQuery: "SELECT forename , surname , age FROM people WHERE month_of_birth = \'March\' OR month_of_birth = \'April\'"
    },
    {
        table: "people",
        difficulty: "hard",
        question: "4. How many people have brown hair and brown eyes? Give me a list of their forenames and ages.",
        correctQuery: "SELECT forename , age FROM people WHERE eye_colour = \'brown\' AND hair_colour = \'brown\'"
    },
        {
        table: "people",
        difficulty: "hard",
        question: "5. Give me the surname, hair colour and eye colour of people who were born after the year 2000 in the month of May.",
        correctQuery: "SELECT surname , hair_colour , eye_colour FROM people WHERE year_of_birth > 2000 AND month_of_birth = \'May\'"
    },
           {
        table: "people",
        difficulty: "hard",
        question: "6. How many people have size 8 feet and black hair?  Show me the forenames, surnnames and eye colours.",
        correctQuery: "SELECT forename , surname , eye_colour FROM people WHERE shoe_size = 8 AND hair_colour = \'black\'"
    },
        {
        table: "people",
        difficulty: "hard",
        question: "7. I want to know the surnames, heights and eye colours of people who are 30 years old and sort them by surname in reverse alphabetical order.",
        correctQuery: "SELECT surname , height , eye_colour FROM people WHERE age = 30 ORDER BY surname DESC"
    },
    {
       table: "people",
        difficulty: "hard",
        question: "8. Can you provide the forenames, shoe sizes and eye colours of people who have a shoe size of 7 OR have hazel eyes? SOrt them in alphabetical order of forename",
        correctQuery: "SELECT forename , shoe_size , eye_colour FROM people WHERE shoe_size = 7 OR eye_colour = \'hazel\' ORDER BY forename ASC"
    },
        {
       table: "people",
        difficulty: "hard",
        question: "9. Give me a list of everyones details, order in alphabetcial order of surname and forename",
        correctQuery: "SELECT * FROM people ORDER BY surname , forename ASC"
    },
         {
       table: "people",
        difficulty: "hard",
        question: "10. Give me a list of everyones details, order in alphabetcial order of surname and reverse order of age!",
        correctQuery: "SELECT * FROM people ORDER BY surname ASC , age DESC"
    },
             {
       table: "people",
        difficulty: "hard",
        question: "11. I need all a list of surnames, fornames, eye colours and heights of everyone with the surname Baker or Brown. Put this list in order from tallest to shortest.",
        correctQuery: "SELECT surname , forename , eye_colour , height FROM people WHERE surname = \'Baker\' OR surname = \'Brown\' ORDER BY height DESC "
    },
    // Challenges for the Cars table
// Challenges for the Cars table
{
    table: "cars",
    difficulty: "easy",
    question: "1. Show me all records from the 'cars' table.",
    correctQuery: "SELECT * FROM cars"
},
{
    table: "cars",
    difficulty: "easy",
    question: "2. I need a list of all cars that are red.",
    correctQuery: "SELECT * FROM cars WHERE colour = \'Red\'"
},
{
    table: "cars",
    difficulty: "easy",
    question: "3. Find all cars that are Hatchbacks.",
    correctQuery: "SELECT * FROM cars WHERE body_style = \'Hatchback\'"
},
{
    table: "cars",
    difficulty: "easy",
    question: "4. Show me all records of cars that run on Petrol.",
    correctQuery: "SELECT * FROM cars WHERE fuel_type = \'Petrol\'"
},
{
    table: "cars",
    difficulty: "easy",
    question: "5. I need a list of all the cities where car owners are located.",
    correctQuery: "SELECT DISTINCT owner_city FROM cars"
},
{
    table: "cars",
    difficulty: "easy",
    question: "6. Provide me with a list of cars ordered by the year they were manufactured, starting with the most recent.",
    correctQuery: "SELECT * FROM cars ORDER BY year_manufactured DESC"
},
{
    table: "cars",
    difficulty: "easy",
    question: "7. Who owns a car registered with the number 'LN01 ABC'? Show all details.",
    correctQuery: "SELECT * FROM cars WHERE registration_no = \'LN01 ABC\'"
},
{
    table: "cars",
    difficulty: "easy",
    question: "8. Find all cars that are owned by people living in Glasgow.",
    correctQuery: "SELECT * FROM cars WHERE owner_city = \'Glasgow\'"
},
{
    table: "cars",
    difficulty: "easy",
    question: "9. Show a list of all cars in alphabetical order by the owner's name.",
    correctQuery: "SELECT * FROM cars ORDER BY owner_name ASC"
},
{
    table: "cars",
    difficulty: "easy",
    question: "10. I need a list of all Diesel cars, ordered by the year they were manufactured, from oldest to newest.",
    correctQuery: "SELECT * FROM cars WHERE fuel_type = \'Diesel\' ORDER BY year_manufactured ASC"
},

    {
    table: "cars",
    difficulty: "medium",
    question: "1. Give me a list of all the different car body styles",
    correctQuery: "SELECT DISTINCT body_style FROM cars"
},
        {
    table: "cars",
    difficulty: "medium",
    question: "2. Give me a list of all the different fuel types cars use",
    correctQuery: "SELECT DISTINCT fuel_type FROM cars"
},
        {
    table: "cars",
    difficulty: "medium",
    question: "3. Give me a list of all the different models made by Ford",
    correctQuery: "SELECT DISTINCT model FROM cars WHERE make = \'Ford\'"
},
        {
    table: "cars",
    difficulty: "medium",
    question: "4. Give me a list of Electric car ownner names and their cities",
    correctQuery: "SELECT owner_name , owner_city FROM cars WHERE fuel_type = \'Electric\' "
},
            {
    table: "cars",
    difficulty: "medium",
    question: "5. I need the registration number and owner names of all cars manufactured after 2018",
    correctQuery: "SELECT registration_no , owner_name FROM cars WHERE year_manufactured > 2018"
},
                {
    table: "cars",
    difficulty: "medium",
    question: "6. Emily Scott owns more than one car.  Show me the make, model and registration number of her cars.",
    correctQuery: "SELECT make , model , registration_no FROM cars WHERE owner_name = \'Emily Scott\'"
},
                {
    table: "cars",
    difficulty: "medium",
    question: "7. We need the owner names, makes and models of all cars in Glasgow",
    correctQuery: "SELECT owner_name , make , model FROM cars WHERE owner_city = \'Glasgow\' "
},
                {
    table: "cars",
    difficulty: "medium",
    question: "8. Show me the the cities, models and colours of all cars sorted in alphabetical order of city",
    correctQuery: "SELECT owner_city , model , colour FROM cars ORDER BY owner_city ASC"
},
                {
    table: "cars",
    difficulty: "medium",
    question: "9. Give me a list of all car owners and registraion numbers in reverse alphabetical order of surname",
    correctQuery: "SELECT owner_name , registration_no FROM cars ORDER BY owner_name DESC"
},
                {
    table: "cars",
    difficulty: "medium",
    question: "10. We know that there is only one Coupe body style car made after 2010 in the table.  Show mw the registraion number, make and model of this car",
    correctQuery: "SELECT registration_no , make , model FROM cars WHERE body_style = \'Coupe\' AND year_manufactured > 2010"
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
