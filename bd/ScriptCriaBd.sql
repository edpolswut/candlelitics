CREATE OR REPLACE DATABASE IF NOT EXISTS Candlelitics;
USE Candlelitics;

CREATE TABLE Usuario (
    Id_Usuario INTEGER PRIMARY KEY,
    Login VARCHAR(40),
    Email VARCHAR(150),
    SenhaHash VARCHAR(150),
    Img LONGBLOB,
    UNIQUE (Id_Usuario, Login, Email)
);

CREATE TABLE Dashboard (
    Id INTEGER PRIMARY KEY UNIQUE,
    Id_Usuario INTEGER,
    Nome VARCHAR(40)
);

CREATE TABLE Cards (
    Id INTEGER PRIMARY KEY UNIQUE,
    Id_Dashboard INTEGER
);
 
ALTER TABLE Dashboard ADD CONSTRAINT FK_Dashboard_3
    FOREIGN KEY (Id_Usuario)
    REFERENCES Usuario (Id_Usuario);
 
ALTER TABLE Cards ADD CONSTRAINT FK_Cards_3
    FOREIGN KEY (Id_Dashboard)
    REFERENCES Dashboard (Id);