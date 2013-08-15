This is a Haraka plugin that will HTTP POST an incoming email to a remote
server. This plugin depends on Redis to store the to: addresses and the URL
to transmit the data to.

This is similar to how Google's App Engine handles incoming emails.

# Installation

1. Install Redis
2. Modify ```config/data.http_forward.ini``` to point to your Redis server
3. Add ```data.http_forward``` to the ```config/plugins``` file
4. Restart Haraka
