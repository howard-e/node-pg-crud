-- Drop All Tables
drop schema public cascade;
create schema public;

grant all on schema public to public;

create table if not exists users
(
    id         SERIAL primary key,
    first_name text,
    last_name  text,
    email      text
);

insert into users (first_name, last_name, email)
values ('Foo', 'Bar', 'foo@bar.com'),
       ('John', 'Doe', 'john.doe@random.net'),
       ('Billy', 'Bob', 'billy.bob@github.io');
