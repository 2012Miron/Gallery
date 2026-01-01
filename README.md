<img src="resources/imgs/logo.png" width="400">

# Brief information

**Gallery** is a site for viewing pictures/photos/documents publicly available for the organization.

The site is designed for the following usage scenarios:

* Public hosting on a separate/built-in domain;
* Hosting on the organization's router;
* Private use for personal purposes.

# Installation
## Automatic (recommended)
Install the script for easy site customization to your needs:
```shell
git clone https://github.com/2012Miron/Gallery-quick-install
```
Launch install script. You will need to answer some configuration questions (what you are going to use the gallery for, who can upload pictures, etc.)

Once setup is complete, start the server with `node app.js`, or integrate the Gallery into your project.
## Manual
```shell
git clone https://github.com/2012Miron/Gallery
cd Gallery
npm install --production # Install dependencies
npm run start # Launch
```

# Documentation

* [Settings & Managing](docs/Setting&Managing.md)
* [Integration](docs/Integration.md)
* [Hosting on the router](docs/RouterHosting.md)
* [Contributing](docs/Contributing.md)
