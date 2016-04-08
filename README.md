# Custom Identity Provider with User Management

This repository contains an advanced sample of Custom Identity Provider to be used with [Mobile Client Access service](https://console.ng.bluemix.net/docs/services/mobileaccess/overview.html) for IBM Bluemix. 

The Mobile Client Access service allows you to create a custom identity provider and implement your own authentication logic of collecting and validating credentials. A custom identity provider is a web application that exposes a RESTful interface. You can host the custom identity provider on premises or on IBM Bluemix. The custom identity provider must be accessible from the public internet so that it can communicate with the Mobile Client Access service.

![image](console-screenshot.png)

> IMPORTANT - While this is an advanced sample, it is not intended for production use as-is. The goals of this sample is to demonstrate a complex use case and serve as a basis for real production implementations. 

## Before you begin

The following instructions assume that you're familiar with Mobile Client Access service and Custom Identity Provider interface. To get more information about these areas, see the following topics:

* [Mobile Client Access overview](https://console.ng.bluemix.net/docs/services/mobileaccess/overview.html)
* [Getting Started with Mobile Client Access](https://console.ng.bluemix.net/docs/services/mobileaccess/getting-started.html)
* [Protecting cloud resources](https://console.ng.bluemix.net/docs/services/mobileaccess/protecting-resources.html)
* [Custom authentication overview](https://console.ng.bluemix.net/docs/services/mobileaccess/custom-auth.html)
* [A custom identity provider interface](https://console.ng.bluemix.net/docs/services/mobileaccess/custom-auth-identity-provider.html)

## Running this sample on IBM Bluemix

This sample has three components:

* REST API for administrative login and user management
* Web-based console for administrative login and user management
* REST API implementing the Custom Identity Provider interface

The sample is built as a Node.js application using technologies like Swagger, Express.js, and Passportjs. To run the sameple on Bluemix you need to have an IBM Bluemix account and the Cloud Foundry toolchain installed. 

> [Sign up for IBM Bluemix](https://console.ng.bluemix.net/registration)

> [Login to IBM Bluemix](https://console.ng.bluemix.net/login)

> [Install and learn how to use Cloud Foundry CLI](https://github.com/cloudfoundry/cli)

1. Start by cloning this sample to your local development environment.

	```
	git clone https://github.com/ibm-bluemix-mobile-services/bms-mca-custom-identity-provider-with-user-management.git
	```
	> Cloud Foundry applications are stateless and do not store any data locally. This sample supports two types of user database persistence - using an in-memory database, that is cleaned up every time application is restarted; and using Cloudant NoSQL DB. 

1. Update the `manifest.yml` file to change the `host` and `name` properties. The `host` property defines your application host after it is deployed to Bluemix, therefore it must be globally unique. The `name` property defines the application name in your current space. 

1. Update `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables in `manifest.yml` file. These would be your login credentials to the user management console. 

1. The default user database persistence mode is in-memory database. It does not require any additional setup, however all the data is erased when the application is restarted. Alternatively, you can configure Cloudant NoSQL DB to serve as a user database persistence layer. To use CloudantNoSQL DB, uncomment four CLOUDANT environment variables in `manifest.yml` file and set their respective values. 

1. Use `cf push` command to deploy your app to Bluemix. 

1. The application might take a few minutes to deploy. AFter the application is successfully deployed, you see the URL to use to access the application. The URL consists of the `host` property that you defined in `manifest.yml` and `mybluemix.net` domain. For example: 

	> `https://my-custom-identity-provider.mybluemix.net`
	
1.  Try browsing the URL of your custom identity provider in your desktop browser. You see a login screen with username and password prompt. Use the credentials that you defined previously in `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables in `manifest.yml` file to login. 

1. Use the user management console to add, update, and delete users. 

1. Click the `API Explorer` button to see Swagger doc for this sample.

## Configuring Mobile Client Access service 

1. To configure your Mobile Client Access service to use a newly deployed Custom Identity Provider. Open the Mobile Client Access Dashboard and enable Custom Authentication. 

1. Use any alphanumerical string as `Realm name`. Keep a note of `Realm name`. You need it to configure authentication in the Mobile Client Access SDK later. 
 
1. The URL of your new Custom Identity Provider that you need to set in the Mobile Client Access Dashboard is `https://<your-application-hostname>/api/custom-identity-provider/v1/`. For example:

	```
	https://johns-identity-provider.mybluemix.net/api/custom-identity-provider/v1/
	```


> For more details about configuring Mobile Client Access service and mobile apps to use Custom Identity Providers, see [Configuring Mobile Client Access for custom authentication](https://console.ng.bluemix.net/docs/services/mobileaccess/custom-auth-config-mca.html)
	

# License
=======================

Copyright 2016 IBM Corp.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 


You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.


