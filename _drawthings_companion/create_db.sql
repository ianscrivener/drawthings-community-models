CREATE SEQUENCE user_id_seq;
CREATE TABLE ckpt(
	id INTEGER PRIMARY KEY DEFAULT nextval('user_id_seq'),
	model_type VARCHAR NOT NULL, 
	model_family VARCHAR NOT NULL, 
	model_name VARCHAR NOT NULL, 
	ckpt_file VARCHAR NOT NULL, 
	url VARCHAR,
	autoencoder VARCHAR, 
	clip_encoder VARCHAR, 
	image_encoder VARCHAR, 
	t5_encoder VARCHAR, 
	full_json JSON
);

