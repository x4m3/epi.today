# epi.today

what's on the calendar today at epitech?

See it live on [epi.today](https://epi.today)!

Licensed under the [MIT License](license.txt).

## maintenance

A maintenance page can be found on the repo [maintenance.html](maintenance.html) which is a file to be rendered when the application is not available.

## deployment

### docker

The application can be found on the [docker hub](https://hub.docker.com/repository/docker/x4m3/epi.today).

In production, that image is used in a container along side nginx for reverse proxy and let's encrypt for the ssl certificates. More information on [nginx-proxy/docker-letsencrypt-nginx-proxy-companion](https://github.com/nginx-proxy/docker-letsencrypt-nginx-proxy-companion).

### nginx

A nginx configuration file example can be found on the repo [nginx.conf](nginx.conf), with a reverse proxy to the application and a maintenance page to `$document_root/epi.today.maintenance.html`. On most systems `$document_root` is located at `/usr/share/nginx/html/`.

To activate the maintenance mode, simply copy the maintenance file to `/usr/share/nginx/epi.today.maintenance.html`. Remove the file when you are done with the maintenance.

### automatic restart

It's recommended to use a daemon to keep the server alive. For epi.today, the daemon [pm2](https://pm2.keymetrics.io) is used.
After compiling the TypeScript code, run `pm2 start build/app.js --name=epi.today` to launch the application with pm2.

To start the application with pm2 at system startup, run `pm2 startup` to get more information.

You can find more information on pm2 in this [DigitalOcean tutorial](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-debian-9).

### https

You can find information on how to do that with let's encrypt on this [DigitalOcean tutorial](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-debian-9).

## environnement file

This project requires the use of a `.env` file to store application settings. Please take a look at file [src/env.ts](src/env.ts) to see what is required inside the `.env` file.
