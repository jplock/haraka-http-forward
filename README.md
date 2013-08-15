This is a Haraka plugin that will HTTP POST an incoming email to a remote
server. This plugin depends on Redis to store the to: addresses and the URL
to transmit the data to.

This is similar to how Google's App Engine handles incoming emails.

# Installation with Docker

1.) Install docker (http://docker.io)
2.) Clone haraka-http-forward repo if you haven't already: git clone https://github.com/jplock/haraka-http-forward.git
3.) Modify config/host_list with the domain(s) that you'd like to receive mail to
4.) Build: cd haraka-http-forward && docker build .
5.) Run:
```
docker run -d <imageid>
redis-cli -p <redisport>
```
