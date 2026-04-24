#!/bin/bash
cd /home/abhishek/SEM2/SPE/MAJOR PROJECT/spe-project/backend
export $(grep -v '^#' /home/abhishek/SEM2/SPE/MAJOR PROJECT/spe-project/.env | xargs)
node server.js