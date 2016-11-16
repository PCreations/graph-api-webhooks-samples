# How to retrieve live video comments in real time with facebook webhooks

Little repo based on github-api-webhooks-sample. It used to use heroku but for the sake of the example we can use ngrok instead to keep it simple.


## Getting started

 1 - Create a facebook app for testing purpose
 2 - Create a facebook page for testing purpose
 3 - Copy the app secret key in `heroku/index.js` l18
 4 - run `npm install && npm start` to start the server at port 5000
 5 - use ngrok to create a local tunnel : `ngrok http 5000`
 6 - copy the https url

Our server is ready to receive information delivered by facebook through its webhooks. We need to do two more things :

 - create the webhook that will send information about our page modifications
 - subscribe our page to this webhook


## Creating the webhook

To create the webhook, just go to your app admin dashboard, create a new *webhook* product. You are given the choice to create four different types of webhook :

 - Page
 - User
 - App
 - Permission

Here, we are interested in the `Page` webhook since we want to get page modifications sent to our server. Let's create a new `Page` webhook. We need to configure two things :

 - a callback url
 - a fields set that we want to be notified for


### Configuring the callback url

The callback url is the URL facebook uses to send you information about changes you are interested in. This url need to accept both `GET` and `POST` request and **must be served over https**. Enter the ngrok secure url in the callback url at the `/facebook` route : eg `https://aebs45fkop.ngrok.io/facebook`. Enter `token` in the verify token field (more on that below).

To validate this endpoint, facebook makes a `GET` request with different params when you hit the "Verify and save" button :
 - `hub.mode` : this variable is given the value `"subscribe"`
 - `hub.challenge` : a random string
 - `hub.verify_token` : the value you entered in verify token field when configuring the callback url

The endpoint should checks that the verify_token is the right one and that the hub.mode is "subscribe". Then, the endpoint must return the value of the `hub.challenge` params, thus telling to facebook that this server is ready to receive information from facebook. In this repo, the `verify_token` value is set to `token`, that's why we need to enter this information in the webhook configuration form.

### Configuring the fields set

I'm not going to detail every fields possible, the documentation is here for that : [https://developers.facebook.com/docs/graph-api/webhooks](https://developers.facebook.com/docs/graph-api/webhooks).
Here, we just need the `feed` field. This field contains all the information about activity that occurs in our page, comments, reactions, etc. When something new happens about comments or reactions on any post of our page, the webhook is triggered and our server receive an object with a certain shape (see in the docs) that we can use to determine what to do (in this repo, we just log the comments if the object receive by facebook tells us that a new comment has been added).


## Subscribing our page to the webhook

Now our webhook is ready, we need to subscribe our page to this webhook. To do so, we need page access token (you might be asked for `manage_pages` and `publish_pages` permission). Let's open the [API Graph Explorer](https://developers.facebook.com/tools/explorer/145634995501895/?method=GET&path=%7Bpage-id%7D%2Fsubscribed_apps&version=v2.8). Then, select your test application in the top right corner instead of the Graph API Explorer application. Open the `Get Token` dropdown and select the page you want an access token for.

The endpoint to read and write subscription is `/v2.8/{page-id}/subscribed_apps`. A `GET` request returns the list of the actual subscriptions for this page and a `POST` request subscribe this page to the selected application at the previous step. The API Graph Explorer should return a success response indicating that the subscription has been done correctly.


## Go live

Go live (via OBS on your desktop or via the facebook pages mobile application). Post comments and check the console of your node server. You should see the comments printed in the console.


# Delay and other caveats

 - Facebook batches updates happening on your page and send them to the webhook every 5 seconds or every 1000 items not sent
 - When a webhook call fails, facebook will retry it for 24h until it passes. **It's up to you to manage duplications that might occur**