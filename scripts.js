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

    // clear current challenge result
    const challengeResult = document.getElementById("challenge-result");
    challengeResult.textContent = "";

    // Load challenges based on the current database
    loadChallenge(currentDatabase); // Automatically load challenges based on the selected database
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
    question: "5. I need a list of all distinct cities where car owners are located.",
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
let currentDifficulty = "easy"; // Default difficulty

function loadChallenge() {
    const challengeContainer = document.getElementById("challenge-container");
    const filteredChallenges = challenges.filter(challenge => 
        challenge.table === currentDatabase && challenge.difficulty === currentDifficulty
    );

    if (filteredChallenges.length === 0) {
        challengeContainer.textContent = "No challenges available for the selected database and difficulty.";
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
<div id="challenge-section" style="display: flex; justify-content: space-between; align-items: center;">
   
    <h2 id="challenge-title" style="margin: 0;  border-style:none;">SQL Challenge</h2>
    <div id="difficulty-buttons" style="display: inline-flex; gap: 10px;">
        <button class="difficulty-button" data-difficulty="easy">Easy</button>
        <button class="difficulty-button" data-difficulty="medium">Medium</button>
        <button class="difficulty-button" data-difficulty="hard">Hard</button>
    </div>
  
</div>
<hr style="border: 1px solid #36d1dc;">
        <p id="challenge-container"></p>
        <button style="margin-bottom:10px; margin-top:10px;" class="run-query-button" onclick="checkChallenge()">
            Submit Challenge Answer
        </button>
        <p id="challenge-result"></p>
    `;
    sqlcDiv.appendChild(challengeSection);

    // Load initial challenge
    loadChallenge();

    // Add event listeners for difficulty buttons
    const difficultyButtons = document.querySelectorAll(".difficulty-button");
    difficultyButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            currentDifficulty = event.target.dataset.difficulty;
            currentChallengeIndex = 0; // Reset challenge index on difficulty change
            loadChallenge(); // Load the first challenge for the new difficulty
        });
    });

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

/*
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
        correctQuery: "SELECT * FROM people WHERE hair_colour = \'brown\'"
    },
        {
        table: "people",
        difficulty: "easy",
        question: "6. Provide me with a list of people who have birthdays in June.",
        correctQuery: "SELECT * FROM people WHERE month_of_birth = \'June\'"
    },
            {
        table: "people",
        difficulty: "easy",
        question: "7. How may people are called Priya? Give me all the details.",
        correctQuery: "SELECT * FROM people WHERE forename = \'Priya\'"
    },
             {
        table: "people",
        difficulty: "easy",
        question: "8. How may people have the last name Baker? Give me all the details.",
        correctQuery: "SELECT * FROM people WHERE forename = \'Baker\'"
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
        question: "10. Who is the tallest peson?  Give me a list of everyone from tallest to shortest",
        correctQuery: "SELECT * FROM people ORDER BY height DESC"
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
*/

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

/*
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
*/

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


