 CREATE TABLE Drink (
    id int AUTO_INCREMENT,
    on_menu BOOLEAN NOT NULL,
    name CHAR(30) NOT NULL,
    description CHAR(250),
    PRIMARY KEY (id)
);

CREATE TABLE Ingredient (
    name CHAR(30),
    description CHAR(250),
    available BOOLEAN NOT NULL,
    price float NOT NULL,
    PRIMARY KEY (name)
);

CREATE TABLE IngredientInDrink (
    d_id INT,
    i_name CHAR(30),
    FOREIGN KEY (d_id)
        REFERENCES drink (id)
        ON DELETE CASCADE,
    FOREIGN KEY (i_name)
        REFERENCES ingredient (name),    #is this one cascaded as well
    PRIMARY KEY (d_id , i_name)
);

CREATE TABLE Bartender (
    eid INT AUTO_INCREMENT,
    name CHAR(30) NOT NULL,
    PRIMARY KEY (eid)
);

CREATE TABLE AlcoholicType (
    type CHAR(30),
    PRIMARY KEY (type)
);

CREATE TABLE AlcoholicIngredient (
    name CHAR(30),
    abv FLOAT(3),
    origin CHAR(30),
    type CHAR(30),
    FOREIGN KEY (name)
        REFERENCES Ingredient (name)
        ON DELETE CASCADE,
    FOREIGN KEY (type)
        REFERENCES AlcoholicType (type)
        ON DELETE CASCADE,
    PRIMARY KEY (name)
);

CREATE TABLE Garnish (
 name CHAR(30),
 FOREIGN KEY (name) 
    REFERENCES Ingredient(name)
    ON DELETE CASCADE,
 PRIMARY KEY (name)
);


CREATE TABLE NonAlcoholic (
 name CHAR(30),
 FOREIGN KEY (name) 
    REFERENCES Ingredient(name)
    ON DELETE CASCADE,
 PRIMARY KEY (name)
);

CREATE TABLE Customer (
 cust_name CHAR(30),
 phone_no BIGINT,
  PRIMARY KEY (cust_name, phone_no),
  CHECK (phone_no > 999999999)
);

CREATE TABLE CustomerOrder (
    order_no INT AUTO_INCREMENT,
    date_time DATETIME NOT NULL,
    bartender INT,
    is_open BOOL NOT NULL,
    notes CHAR(250),
    table_no INT NOT NULL,
    phone_no BIGINT NOT NULL,
    cust_name CHAR(30) NOT NULL,
    FOREIGN KEY (bartender)
        REFERENCES Bartender (eid),
    FOREIGN KEY (cust_name , phone_no)
        REFERENCES Customer (cust_name , phone_no),
    PRIMARY KEY (order_no)
);

CREATE TABLE DrinksInOrder (
    row_id BIGINT AUTO_INCREMENT,
    order_no INT,
    drink_id INT,
    FOREIGN KEY (order_no)
        REFERENCES CustomerOrder (order_no),
    FOREIGN KEY (drink_id)
        REFERENCES Drink (id),
    PRIMARY KEY (row_id)
);

CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT,
    amount FLOAT,
    card_no VARCHAR(22),
    order_no INT,
    FOREIGN KEY (order_no)
        REFERENCES CustomerOrder (order_no)
        ON DELETE CASCADE,
    PRIMARY KEY (payment_id , order_no)
);

CREATE TABLE Admin (
    name CHAR(30),
    pw CHAR(30)
);

CREATE VIEW drinkswithwhiskey AS
  SELECT d.id, d.name, ai.type
  FROM drink d, ingredientindrink iid, ingredient i, alcoholicingredient ai
  WHERE d.id = iid.d_id
        AND iid.i_name = i.name
        AND i.name = ai.name
        AND ai.type LIKE "%whiskey%";

CREATE VIEW NonWhiskeyOrders AS
  SELECT c.bartender, do.drink_id
  FROM customerorder c, drinksinorder do
  WHERE c.order_no = do.order_no
        AND do.drink_id NOT IN (
    SELECT dw.id
    FROM drinkswithwhiskey dw
  );

CREATE VIEW BartendersServedWhiskey AS
  SELECT c.bartender, do.drink_id
  FROM customerorder c, drinksinorder do
  WHERE c.order_no = do.order_no
        AND (do.drink_id NOT IN (
    SELECT dw.drink_id
    FROM nonwhiskeyorders dw
  ))
  GROUP BY c.bartender, do.drink_id;

CREATE VIEW WhiskeyDrinkServedByAll AS
  SELECT d.name
  FROM bartendersservedwhiskey bsw, drink d
  WHERE bsw.drink_id = d.id
  GROUP BY bsw.drink_id
  HAVING COUNT(bsw.bartender) = (
    SELECT COUNT(*)
    FROM bartender
  );

CREATE VIEW WhiskeyExperts AS
  SELECT bsw.bartender AS id, b.name
  FROM bartendersservedwhiskey bsw, bartender b
  WHERE bsw.bartender = b.eid
  GROUP BY bsw.bartender
  HAVING COUNT(bsw.bartender) = (
    SELECT COUNT(*)
    FROM drinkswithwhiskey
  );

