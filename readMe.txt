Database:
->admin table is created
    CREATE TABLE admin(
        username VARCHAR(30),
        password VARCHAR(30)
    );
    insert into admin values ('admin','admin@123');
->users table is created
    CREATE TABLE users(
        id INTEGER auto_increment,
        username VARCHAR(30),
        password VARCHAR(30),
        PRIMARY KEY(id)
    );
    insert into users (id,username,password) values
    (101,'Vikanth','vikanth@7'),
    (102,'Striver','striver@123'),
    (103,''Shradha','shradha@123'),
    (104,'Arsh','arsh@123');
->subscriptions table is created
    CREATE TABLE subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        subscription_type VARCHAR(255),
        subscription_start_date DATE,
        subscription_end_date DATE,
        payment_status VARCHAR(255),
        last_payment_date DATE
    );
    insert into subscriptions (id,user_id,subscription_type,subscription_start_date,subscription_end_date,payment_status,last_payment_date) values
    (201,101,'Monthly','2024-01-08','2024-02-07','Pending','2024-01-08');
    (202,101,'Annual','2023-06-16','2024-06-15','Success','2023-06-16');
    (203,102,'Quartely','2024-03-16','2024-06-15','Success','2024-03-16');
    (204,102,'Monthly','2024-04-10','2024-05-09','Pending','2024-04-10');


->subscription_requests table is created
    CREATE TABLE subscription_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    subscription_type VARCHAR(255),
    subscription_start_date DATE,
    subscription_end_date DATE,
    payment_status VARCHAR(255),
    last_payment_date DATE,
    status VARCHAR(50) DEFAULT 'pending'
);

All the table structures are provided in the sql_table_structures

By default there is only a single admin.

When a user is loggedIn, the subscriptions corresponding to that user are displayed.
When he tries to add subscription, a request is sent to the admin and all the fields are inserted into subscription_requests table,
the admin , if accepts the approval the fields are inserted into the subscriptions table and deleted from the subscription_requests table,
else just it is deleted from the subscription_requests table. 