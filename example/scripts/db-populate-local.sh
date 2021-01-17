#!/usr/bin/env bash

PGPASSWORD="Passw0rd1" psql -U admin -h localhost -p 5432 -d database < populate.sql
