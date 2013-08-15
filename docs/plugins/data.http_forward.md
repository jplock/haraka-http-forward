data.http_forward
========

This plugin will forward an incoming email body (with attachments) to a remote
HTTP server. Incoming to: addresses are looked up in a Redis server where the
value represents the HTTP URL to POST the email message.

This is similar to how Google's App Engine handles incoming emails.

Configuration
-------------

* `config/http_forward.ini` - controls the Redis parameters.
