REM Requires mongo, mongod, and nodemon to be in the path
start cmd /k "mongod --dbpath=data"
start cmd /k "nodemon index.js"