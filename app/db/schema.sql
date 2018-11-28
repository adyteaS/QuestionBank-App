CREATE TABLE courses (
	course_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	course_name TEXT(255,0) NOT NULL,
	course_number INTEGER NOT NULL
);
CREATE TABLE questions (
	question_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	question_text TEXT(255,0) NOT NULL,
	image_path TEXT(255,0),
  	question_type TEXT(255,0) NOT NULL,
	question_point INTEGER NOT NULL,
  	course_id INTEGER REFERENCES courses(course_id) ON DELETE CASCADE
);
CREATE TABLE options (
	option_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	context TEXT(255,0) NOT NULL,
	image_path TEXT(255,0),
  question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE,
  is_correct INTEGER NOT NULL
);

CREATE TABLE question_sets (
	question_set_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	question_set_name TEXT(255,0) NOT NULL,
	course_id INTEGER REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE question_set_items (
	question_set_item_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	question_set_id INTEGER REFERENCES question_sets(question_set_id) ON DELETE CASCADE,
	question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE
);
