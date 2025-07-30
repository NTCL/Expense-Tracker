# Expense-Tracker
This is an expense tracker web app where users can add expense entries with different types and view the expense summary. It is built using Express.js and React with MySQL database.

## Requirement
node v20.18.0

npm v10.8.2

docker v27.3.1

## Installation

### 1. Clone the repositroy
```sh
git clone https://github.com/NTCL/Expense-Tracker.git
cd Expense-tracker
```

### 2.Create an '.env' file with the following in the root directory
```sh
DB_ROOT_PASSWORD=db_root_password
DB_USERNAME=db_user
DB_PASSWORD=db_password
```

### 3. Use Docker to build and run the app
```sh
docker-compose up --build
```

## Usage
Visit 'http://localhost:3000' in the browser to use the application
