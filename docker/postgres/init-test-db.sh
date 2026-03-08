#!/bin/bash
set -e

# Create test database for running tests
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE exibi_test;
    GRANT ALL PRIVILEGES ON DATABASE exibi_test TO $POSTGRES_USER;
EOSQL

echo "Test database 'exibi_test' created successfully"
