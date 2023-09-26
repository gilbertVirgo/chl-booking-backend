# chl-booking-backend

### To start the api server on the Digital Ocean droplet

npm run start-server

### For copying the old mongo database into a json file (to then be uploaded onto Google Sheets)

mongoexport --db=chl --collection=bookings --jsonArray --fields=client,event,dateCreated,lastModified,status,archived --out=output.json

Then use SCL to copy the file to this directory.
