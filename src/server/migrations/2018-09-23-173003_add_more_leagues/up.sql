INSERT INTO sports(name) VALUES ('pingpong');
INSERT INTO sports(name) VALUES ('food');

INSERT INTO leagues(name, sport_id) VALUES ('Addepar Ping-Pong', (SELECT id FROM sports WHERE name = 'pingpong'));
INSERT INTO leagues(name, sport_id) VALUES ('Addepar Snacks', (SELECT id FROM sports WHERE name = 'food'));
