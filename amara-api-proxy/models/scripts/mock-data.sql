BEGIN TRANSACTION;

INSERT INTO "tasks" VALUES ('JS4TMAF','2020-10-21T12:45:15.241Z', 5, ''),
 ('0UTJG1S','2020-10-21T14:25:15.241Z', 10, ''),
 ('9AR30EW','2020-10-21T16:35:15.241Z', 15, ''),
 ('TNEYKA0','2020-10-21T13:20:15.241Z', 2, '');

INSERT INTO "user_a_task" VALUES ('JS4TMAF', 'p2pmodels.user1'),
 ('0UTJG1S', 'p2pmodels.user1'),
 ('9AR30EW', 'p2pmodels.user2'),
 ('TNEYKA0', 'p2pmodels.user3');

-- INSERT INTO "user_r_task" VALUES ('JS4TMAF', 'p2pmodels.user1'),
--  ('0UTJG1S', 'p2pmodels.user1'),
--  ('9AR30EW', 'p2pmodels.user2'),
--  ('TNEYKA0','p2pmodels.user3');

COMMIT;

