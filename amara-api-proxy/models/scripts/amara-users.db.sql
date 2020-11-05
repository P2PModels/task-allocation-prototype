BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "user_language" (
	"idUser"	INTEGER,
	"idLanguage"	INTEGER,
	FOREIGN KEY("idUser") REFERENCES "users"("id"),
	PRIMARY KEY("idUser","idLanguage"),
	FOREIGN KEY("idLanguage") REFERENCES "languages"("id")
);
CREATE TABLE IF NOT EXISTS "languages" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"code"	TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "user_team" (
	"idUser"	TEXT NOT NULL,
	"idTeam"	INTEGER NOT NULL,
	FOREIGN KEY("idUser") REFERENCES "users"("id"),
	FOREIGN KEY("idTeam") REFERENCES "teams"("id"),
	PRIMARY KEY("idTeam","idUser")
);
CREATE TABLE IF NOT EXISTS "teams" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "users" (
	"username"	TEXT NOT NULL,
	"apiKey"	INTEGER NOT NULL UNIQUE,
	"active"	INTEGER NOT NULL DEFAULT 0,
	"id"	TEXT,
	PRIMARY KEY("id")
);
INSERT INTO "user_language" VALUES ('Hgqn-qWZgfqU0Lb0HK2yiV0qdfD8Pb-26LBOLpfQxH4',1),
 ('Hgqn-qWZgfqU0Lb0HK2yiV0qdfD8Pb-26LBOLpfQxH4',2),
 ('Hgqn-qWZgfqU0Lb0HK2yiV0qdfD8Pb-26LBOLpfQxH4',3),
 ('Hgqn-qWZgfqU0Lb0HK2yiV0qdfD8Pb-26LBOLpfQxH4',4),
 ('Hgqn-qWZgfqU0Lb0HK2yiV0qdfD8Pb-26LBOLpfQxH4',5),
 ('Hgqn-qWZgfqU0Lb0HK2yiV0qdfD8Pb-26LBOLpfQxH4',6),
 ('6gVMoSf1BSqTcOzzPNZvR7iUdQZkQrjKNFZoLWwMtRM',1),
 ('6gVMoSf1BSqTcOzzPNZvR7iUdQZkQrjKNFZoLWwMtRM',2),
 ('6gVMoSf1BSqTcOzzPNZvR7iUdQZkQrjKNFZoLWwMtRM',3),
 ('6gVMoSf1BSqTcOzzPNZvR7iUdQZkQrjKNFZoLWwMtRM',4),
 ('6gVMoSf1BSqTcOzzPNZvR7iUdQZkQrjKNFZoLWwMtRM',5),
 ('6gVMoSf1BSqTcOzzPNZvR7iUdQZkQrjKNFZoLWwMtRM',6),
 ('dbGiAE2vt8NKtbLx0BZegFAEUXZgwOMP5xleafbvkyQ',1),
 ('dbGiAE2vt8NKtbLx0BZegFAEUXZgwOMP5xleafbvkyQ',2),
 ('dbGiAE2vt8NKtbLx0BZegFAEUXZgwOMP5xleafbvkyQ',3),
 ('dbGiAE2vt8NKtbLx0BZegFAEUXZgwOMP5xleafbvkyQ',4),
 ('dbGiAE2vt8NKtbLx0BZegFAEUXZgwOMP5xleafbvkyQ',5),
 ('dbGiAE2vt8NKtbLx0BZegFAEUXZgwOMP5xleafbvkyQ',6),
 ('h-IgKrFdwg7QFAWVVsWhbZQ1lLr3FKpV-Z6CXeYMqcs',1),
 ('h-IgKrFdwg7QFAWVVsWhbZQ1lLr3FKpV-Z6CXeYMqcs',2),
 ('h-IgKrFdwg7QFAWVVsWhbZQ1lLr3FKpV-Z6CXeYMqcs',3),
 ('h-IgKrFdwg7QFAWVVsWhbZQ1lLr3FKpV-Z6CXeYMqcs',4),
 ('h-IgKrFdwg7QFAWVVsWhbZQ1lLr3FKpV-Z6CXeYMqcs',5),
 ('h-IgKrFdwg7QFAWVVsWhbZQ1lLr3FKpV-Z6CXeYMqcs',6),
 ('3Y2pyqeaek43pF6B_sWSupwjUILK-yn4OkPH7Wg6_mo',1),
 ('3Y2pyqeaek43pF6B_sWSupwjUILK-yn4OkPH7Wg6_mo',2),
 ('3Y2pyqeaek43pF6B_sWSupwjUILK-yn4OkPH7Wg6_mo',3),
 ('3Y2pyqeaek43pF6B_sWSupwjUILK-yn4OkPH7Wg6_mo',4),
 ('3Y2pyqeaek43pF6B_sWSupwjUILK-yn4OkPH7Wg6_mo',5),
 ('3Y2pyqeaek43pF6B_sWSupwjUILK-yn4OkPH7Wg6_mo',6),
 ('zy7fFEcf_TL6rYpdfxN7q_T4KZ-7KMUI9yKJhg7nSi4',1),
 ('zy7fFEcf_TL6rYpdfxN7q_T4KZ-7KMUI9yKJhg7nSi4',2),
 ('zy7fFEcf_TL6rYpdfxN7q_T4KZ-7KMUI9yKJhg7nSi4',3),
 ('zy7fFEcf_TL6rYpdfxN7q_T4KZ-7KMUI9yKJhg7nSi4',4),
 ('zy7fFEcf_TL6rYpdfxN7q_T4KZ-7KMUI9yKJhg7nSi4',5),
 ('zy7fFEcf_TL6rYpdfxN7q_T4KZ-7KMUI9yKJhg7nSi4',6);
INSERT INTO "languages" VALUES (1,'de'),
 (2,'pt-br'),
 (3,'en'),
 (4,'fr'),
 (5,'es'),
 (6,'ar');
INSERT INTO "user_team" VALUES ('Hgqn-qWZgfqU0Lb0HK2yiV0qdfD8Pb-26LBOLpfQxH4',5),
 ('6gVMoSf1BSqTcOzzPNZvR7iUdQZkQrjKNFZoLWwMtRM',5),
 ('dbGiAE2vt8NKtbLx0BZegFAEUXZgwOMP5xleafbvkyQ',5),
 ('h-IgKrFdwg7QFAWVVsWhbZQ1lLr3FKpV-Z6CXeYMqcs',5),
 ('3Y2pyqeaek43pF6B_sWSupwjUILK-yn4OkPH7Wg6_mo',5),
 ('zy7fFEcf_TL6rYpdfxN7q_T4KZ-7KMUI9yKJhg7nSi4',5);
INSERT INTO "teams" VALUES (1,'ability'),
 (2,'captions-requested'),
 (3,'github'),
 (4,'globalvoices'),
 (5,'collab-demo-team');
INSERT INTO "users" VALUES ('p2pmodels.user1','fd28c1601921f6d24a6ccaa49740ef2ae66527fe',1,'Hgqn-qWZgfqU0Lb0HK2yiV0qdfD8Pb-26LBOLpfQxH4'),
 ('p2pmodels.user2','3c05687f91bf69978761ed554d6eccb60ba0ba37',0,'6gVMoSf1BSqTcOzzPNZvR7iUdQZkQrjKNFZoLWwMtRM'),
 ('p2pmodels.user3','95d9275680d481bb0b00e236e51ae9233497e469',1,'dbGiAE2vt8NKtbLx0BZegFAEUXZgwOMP5xleafbvkyQ'),
 ('p2pmodels.user4','dba20072ea26267c20ecbe511c0574de6c54ab63',0,'h-IgKrFdwg7QFAWVVsWhbZQ1lLr3FKpV-Z6CXeYMqcs'),
 ('paulo-demo','525a2b625baf11a48566f4b32876d0bfad9375ba',0,'3Y2pyqeaek43pF6B_sWSupwjUILK-yn4OkPH7Wg6_mo'),
 ('p2pmodels.user5','27dae1c5b4e0425e137eae34d8dbe2eae541fb08',0,'zy7fFEcf_TL6rYpdfxN7q_T4KZ-7KMUI9yKJhg7nSi4');
COMMIT;
