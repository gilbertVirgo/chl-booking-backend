# chl-booking-backend

###

mongoexport --db=chl --collection=bookings --jsonArray --fields=client,event,dateCreated,lastModified,status,archived --out=output.json

Then use SCL to copy the file to this directory.
